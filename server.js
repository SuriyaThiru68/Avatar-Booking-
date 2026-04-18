require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Disable buffering so that queries fail fast instead of hanging when DB is down
mongoose.set('bufferCommands', false);
const Booking = require('./models/Booking');

const app = express();
const PORT = process.env.PORT || 3002;

// Gemini Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel(
  { model: "gemini-3-flash-preview" },
  { apiVersion: 'v1' } 
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI && !MONGODB_URI.includes('<username>')) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => {
      if (err.message.includes('authentication failed')) {
        console.error('❌ MongoDB Auth Failed: Check your username/password in .env and IP whitelist.');
      } else {
        console.error('❌ Error connecting to MongoDB:', err.message);
      }
    });
} else {
  console.warn('⚠️ MONGODB_URI is not set up correctly in .env.');
}

// Chat with AI endpoint
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ success: false, error: 'Messages are required' });
  }

  try {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const systemPrompt = `You are Aura, a warm, intelligent, and concise AI booking assistant.
Your personality: friendly, helpful, efficient. Use natural, simple English. Keep replies short (2-4 sentences max).

Your capabilities:
- Book appointments (doctor, meeting, video consult, wellness check)
- Check available time slots
- Reschedule or cancel appointments
- Remember what the user tells you in this session

How it works for Clients:
1. Register an account by clicking "Join Now".
2. Browse professionals on the homepage.
3. Book a session with your preferred expert.
4. Manage bookings from your profile dashboard.
5. Track history in the "My Bookings" page.

How it works for Professionals:
1. Register as a Professional during sign-up.
2. Complete your profile with expertise and availability.
3. Manage bookings through the professional dashboard.
4. Track ratings and client feedback.
5. Update availability as needed.

When a user wants to book:
1. Ask for their preferred service type (if not stated)
2. Ask for preferred date  
3. Suggest 2-3 time slots
4. Confirm name and email
5. Say "Perfect! I'll open the booking calendar for you now." to trigger the booking UI

For slot enquiry: suggest morning (9-11 AM), afternoon (1-4 PM), or evening (4-6 PM) options.
For cancellations: empathize briefly, then confirm.

Always respond in 1-3 sentences. Be warm but efficient. Personalization: it's currently ${greeting}.`;

    // Build Gemini history — must start with 'user' and alternate roles.
    // The client sends the initial AI greeting as role 'assistant' which maps
    // to 'model'. Gemini rejects histories that start with 'model', so we:
    //  1. Convert roles
    //  2. Drop everything before (and including) the first 'user' turn
    //  3. Inject the system prompt as the very first user message
    const rawHistory = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Find the index of the first 'user' entry
    const firstUserIdx = rawHistory.findIndex(m => m.role === 'user');

    // Build a clean alternating history starting from the first user message,
    // but de-duplicate consecutive same-role entries (keep last of each run)
    const cleanHistory = [];
    if (firstUserIdx !== -1) {
      const slice = rawHistory.slice(firstUserIdx);
      for (const entry of slice) {
        if (cleanHistory.length > 0 && cleanHistory[cleanHistory.length - 1].role === entry.role) {
          // Merge consecutive same-role turns to keep alternation
          cleanHistory[cleanHistory.length - 1].parts[0].text += '\n' + entry.parts[0].text;
        } else {
          cleanHistory.push({ role: entry.role, parts: [{ text: entry.parts[0].text }] });
        }
      }
    }

    // Prepend system context as the first user + model exchange so Gemini always
    // has valid alternating history even on the very first message.
    const fullHistory = [
      { role: 'user',  parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I am Aura, ready to help.' }] },
      ...cleanHistory,
    ];

    const chat = model.startChat({
      history: fullHistory,
      generationConfig: { maxOutputTokens: 500 },
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    res.json({ 
      success: true, 
      reply: text 
    });
  } catch (error) {
    console.error('GEMINI CHAT ERROR:', error); // Log full error object
    
    // FALLBACK LOGIC
    let fallbackReply = "I am here to help you book an appointment. How can I facilitate your request?";
    const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';

    if (lastUserMsg.includes('hello') || lastUserMsg.includes('hi')) {
       fallbackReply = "Hello! I am Aura. Would you like to book an appointment with us today?";
    } else if (lastUserMsg.includes('book') || lastUserMsg.includes('appointment') || lastUserMsg.includes('yes')) {
       fallbackReply = "Great! I'm ready to book. What day and time works best for you? (e.g. Monday at 10 AM)";
    }

    res.json({ success: true, reply: fallbackReply, note: 'Gemini error fallback' });
  }
});

// D-ID API proxy endpoint
app.post('/api/generate-avatar', async (req, res) => {
  const { text } = req.body;
  
  if (!text) return res.status(400).json({ error: 'Text is required' });

  try {
    const response = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.DID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        script: {
          type: 'text',
          input: text,
          provider: { type: 'microsoft', voice_id: 'en-US-JennyNeural' }
        },
        source_url: 'https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg',
        config: { fluent: true, stitch: true }
      })
    });

    const data = await response.json();
    res.json({ success: true, talkId: data.id });
  } catch (error) {
    console.error('D-ID Error:', error);
    res.status(500).json({ success: false, error: 'Avatar generation failed' });
  }
});

// Check avatar status
app.get('/api/avatar-status/:talkId', async (req, res) => {
  const { talkId } = req.params;
  try {
    const response = await fetch(`https://api.d-id.com/talks/${talkId}`, {
      headers: { 'Authorization': `Basic ${process.env.DID_API_KEY}` }
    });
    const data = await response.json();
    
    if (data.status === 'completed') {
      res.json({ success: true, status: 'completed', videoUrl: data.result_url });
    } else {
      res.json({ success: true, status: 'processing' });
    }
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Booking endpoint
app.post('/api/bookings', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.status(201).json({ success: true, message: 'Booking saved!' });
  } catch (error) {
    console.error('POST /api/bookings error:', error.message);
    // Return a graceful message instead of a raw 500
    res.status(200).json({
      success: false,
      db_unavailable: true,
      message: 'Booking recorded locally — database is currently unavailable.',
    });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('GET /api/bookings error:', error.message);
    // Return empty list gracefully instead of 500
    res.status(200).json({
      success: true,
      bookings: [],
      db_unavailable: true,
      message: 'Database unavailable — showing empty list.',
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));

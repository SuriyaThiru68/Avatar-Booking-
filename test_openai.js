require('dotenv').config();
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function test() {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: 'user', content: 'say test' }]
    });
    console.log('API SUCCESS:', res.choices[0].message.content);
  } catch (err) {
    console.error('API FAILURE:', err.message);
  }
}
test();

# 🤖 Aura - Avatar Appointment Booking

Aura is a modern AI-led appointment booking platform featuring a talking AI concierge, voice/text interaction, and a sleek high-fidelity UI.

## 🚀 Quick Start (One Command)

To run both the **Backend** and **Frontend** at the same time:

1.  Open your terminal in the project root folder.
2.  Run:
    ```bash
    npm run dev:all
    ```
3.  Open your browser to: **[http://localhost:5173](http://localhost:5173)**

---

## 🛠️ Step-by-Step Manual Start

If you prefer to run them separately (better for debugging):

### 1. Start the Backend Server
1.  Open a terminal in the root folder.
2.  Run:
    ```bash
    npm install
    npm run dev
    ```
    *The server will start on [http://localhost:3002](http://localhost:3002)*

### 2. Start the Frontend (Vite)
1.  Open a **new** terminal and go into the `client` folder:
    ```bash
    cd client
    ```
2.  Run:
    ```bash
    npm install
    npm run dev
    ```
    *The frontend will start on [http://localhost:5173](http://localhost:5173)*

---

## 🔑 Environment Variables (.env)

Make sure you have a `.env` file in the root folder with the following:

```env
PORT=3002
MONGODB_URI=your_mongodb_atlas_url
DID_API_KEY=your_d_id_api_key
OPENAI_API_KEY=your_openai_api_key
```

> [!TIP]
> **No Credits?** If your OpenAI or D-ID keys run out of credits, Aura will automatically switch to **Simulated Mode** so you can still demonstrate the booking flow!

## 📅 Key Features
- **Voice Input**: Click the mic to talk to Aura.
- **Talking Captions**: AI replies appear as readable text on screen.
- **Booking Hub**: Integrated date/time selection module.
- **Atlas Sync**: Appointments are saved directly to MongoDB Atlas.

---

## 👥 How it Works

### For Clients
1. **Register an account** by clicking "Join Now"
2. **Browse professionals** on the homepage
3. **Book a session** with your preferred expert
4. **Manage bookings** from your profile dashboard
5. **Track history** in the "My Bookings" page

### For Professionals
1. **Register as a Professional** during sign-up
2. **Complete your profile** with expertise and availability
3. **Manage bookings** through the professional dashboard
4. **Track ratings** and client feedback
5. **Update availability** as needed

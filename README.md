# 🐬 Goldphin AI Backend

Backend server for Goldphin AI - A universal AI chat interface that supports multiple providers.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. **Create a new folder for the backend:**
```bash
mkdir goldphin-backend
cd goldphin-backend
```

2. **Save the files:**
- Save `server.js` in this folder
- Save `package.json` in this folder

3. **Install dependencies:**
```bash
npm install
```

4. **Start the server:**
```bash
npm start
```

You should see:
```
╔═══════════════════════════════════════╗
║   🐬 Goldphin AI Backend Server      ║
║   Running on http://localhost:3000   ║
╚═══════════════════════════════════════╝
```

5. **Open your frontend HTML file** in a browser and start chatting!

## 📁 Project Structure

```
goldphin-backend/
├── server.js          # Main server file
├── package.json       # Dependencies & scripts
└── README.md         # This file
```

## 🔧 Configuration

The server runs on **port 3000** by default. To change it:

```bash
PORT=5000 npm start
```

Or set the `PORT` environment variable in your system.

## 🧪 Testing the Server

### Check if server is running:
```bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Goldphin AI Backend is running!",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test with a sample request:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gemini",
    "apiKey": "YOUR_API_KEY",
    "model": "gemini-2.0-flash-exp",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

## 🌐 Supported AI Providers

### 1. Google Gemini
- **Provider:** `gemini`
- **Default Model:** `gemini-2.0-flash-exp`
- **Get API Key:** https://makersuite.google.com/app/apikey

### 2. OpenAI
- **Provider:** `openai`
- **Default Model:** `gpt-4o-mini`
- **Get API Key:** https://platform.openai.com/api-keys

### 3. Anthropic Claude
- **Provider:** `anthropic`
- **Default Model:** `claude-3-5-sonnet-20241022`
- **Get API Key:** https://console.anthropic.com/

### 4. Custom API
- **Provider:** `custom`
- **Requires:** Custom endpoint URL
- **Format:** Should follow OpenAI-compatible format

## 🔒 Security Notes

- API keys are sent from the frontend to this backend, then to AI providers
- This server acts as a proxy to avoid CORS issues
- **Never commit API keys to version control**
- For production, add authentication and rate limiting

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 3000 is already in use
lsof -i :3000

# Use a different port
PORT=4000 npm start
```

### "Cannot connect to backend server" error
1. Make sure the server is running (`npm start`)
2. Check the `BACKEND_SERVER_URL` in your HTML file matches `http://localhost:3000`
3. Ensure no firewall is blocking localhost connections

### API errors
- **401 Unauthorized:** Check your API key is correct
- **429 Too Many Requests:** You've hit rate limits, wait a bit
- **500 Internal Server Error:** Check server logs for details

## 📝 Development

To run with auto-reload on file changes:
```bash
npm run dev
```

(Requires `nodemon` - already included in devDependencies)

## 🚢 Deployment

### Deploy to Heroku:
```bash
heroku create goldphin-backend
git push heroku main
```

### Deploy to Railway:
1. Connect your GitHub repo
2. Railway will auto-detect Node.js
3. Set environment variables if needed

### Deploy to Render:
1. Create a new Web Service
2. Connect your repo
3. Build command: `npm install`
4. Start command: `npm start`

**Important:** After deployment, update `BACKEND_SERVER_URL` in your HTML file to your deployed URL!

## 📊 API Response Format

Successful response:
```json
{
  "success": true,
  "response": "AI generated text here..."
}
```

Error response:
```json
{
  "success": false,
  "error": "Error message here"
}
```

## 🤝 Contributing

Created by **Avinash Waghmare**, CSE Student at MIT College, Chhatrapati Sambhaji Nagar.

Feel free to fork, modify, and improve!

## 📄 License

MIT License - Free to use for personal and commercial projects.

---

**Need help?** Check the server logs - they show detailed info about each request!

**Pro tip:** Keep the terminal window open where you ran `npm start` to see real-time logs of what's happening.

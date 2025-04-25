const express = require('express');
const app = express();

app.use(express.json()); 

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load chatbot.proto and gRPC client
const chatbotProtoPath = path.join(__dirname, 'proto', 'chatbot.proto');
const chatbotDef = protoLoader.loadSync(chatbotProtoPath);
const chatbotProto = grpc.loadPackageDefinition(chatbotDef).chatbot;

const client = new chatbotProto.ChatbotService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Setup EJS and middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Allow both forms and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // 🔥 This is needed for JSON AJAX parsing

// Serve static files (optional if you want to include external CSS/JS)
app.use(express.static(path.join(__dirname, 'public')));

// Home route – no need for lastReply anymore since we're using AJAX
app.get('/', (req, res) => {
  res.render('index'); // ✨ Cleaner now, no need to pass `bot_reply`
});

// Basic API Key Middleware
const API_KEY = 'supersecretapikey123'; // Hardcoded API key for demo purposes

app.use((req, res, next) => {
  const userApiKey = req.headers['api-key'];
  if (userApiKey && userApiKey === API_KEY) {
    next(); // Correct key: allow request
  } else {
    res.status(401).send('Unauthorized: Invalid API Key'); // Block access
  }
});

// AJAX Chatbot route
app.post('/chat', (req, res) => {
  const userMessage = req.body.user_message;
  console.log("📩 User message received:", userMessage);

  client.SendMessage({ user_message: userMessage }, (err, response) => {
    if (err) {
      console.error("❌ gRPC ERROR:", err.message);
      return res.status(500).json({ bot_reply: "Oops! Something went wrong." });
    }

    console.log("🤖 Bot response:", response.bot_reply);
    res.json({ bot_reply: response.bot_reply });
  });
});

// Start server
app.listen(3000, () => {
  console.log("🌍 Nodeflix Chatbot GUI running at http://localhost:3000");
});

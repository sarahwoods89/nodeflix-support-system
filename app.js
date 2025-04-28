// app.js
const express = require('express');
const app = express();
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

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Needed for JSON AJAX parsing
app.use(express.static(path.join(__dirname, 'public')));

// Home route
app.get('/', (req, res) => {
  res.render('index'); 
});

// AJAX Chatbot route (POST)
app.post('/chat', (req, res) => {
  const userMessage = req.body.user_message;
  console.log("📩 User message received:", userMessage);

  client.SendMessage({ user_message: userMessage }, (err, response) => {
    if (err || !response || !response.bot_reply) {
      console.error("❌ gRPC ERROR:", err ? err.message : "No bot reply received");
      return res.status(500).json({ bot_reply: "Sorry, I didn't get a reply from the bot." });
    }

    console.log("🤖 Bot response:", response.bot_reply);
    res.json({ bot_reply: response.bot_reply });
  });
});

// 🔒 Optional: API key middleware AFTER /chat if you want to protect other routes
const API_KEY = 'supersecretapikey123';

app.use((req, res, next) => {
  const userApiKey = req.headers['api-key'];
  if (userApiKey && userApiKey === API_KEY) {
    next();
  } else {
    res.status(401).send('Unauthorized: Invalid API Key');
  }
});

// Start server
app.listen(3000, () => {
  console.log("🌍 Nodeflix Chatbot GUI running at http://localhost:3000");
});

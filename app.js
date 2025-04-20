const express = require('express');
const app = express();
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

let lastReply = null;

const chatbotProtoPath = path.join(__dirname, 'proto', 'chatbot.proto');
const chatbotDef = protoLoader.loadSync(chatbotProtoPath);
const chatbotProto = grpc.loadPackageDefinition(chatbotDef).chatbot;

const client = new chatbotProto.ChatbotService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Setup EJS and form parsing
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.render('index', { bot_reply: lastReply });
  lastReply = null;
});

app.post('/chat', (req, res) => {
  const userMessage = req.body.user_message;

  client.SendMessage({ user_message: userMessage }, (err, response) => {
    lastReply = err ? "Oops, something went wrong: " + err.message : response.bot_reply;
    res.redirect('/');
  });
});

// Start Express GUI
app.listen(3000, () => {
  console.log("🌍 GUI running at http://localhost:3000");
});

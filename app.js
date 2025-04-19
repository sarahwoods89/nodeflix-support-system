const express = require('express');
const app = express();
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'proto', 'chatbot.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const chatbotProto = grpc.loadPackageDefinition(packageDefinition).chatbot;

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
  res.render('index', { bot_reply: null });
});

app.post('/chat', (req, res) => {
  const userMessage = req.body.user_message;

  client.SendMessage({ user_message: userMessage }, (err, response) => {
    if (err) {
      return res.send("Error: " + err.message);
    }
    res.render('index', { bot_reply: response.bot_reply });
  });
});

// Start Express GUI
app.listen(3000, () => {
  console.log("🌍 GUI running at http://localhost:3000");
});

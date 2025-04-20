const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const chatbotProtoPath = path.join(__dirname, 'proto', 'chatbot.proto');
const chatbotDef = protoLoader.loadSync(chatbotProtoPath);
const chatbotProto = grpc.loadPackageDefinition(chatbotDef).chatbot;

const client = new chatbotProto.ChatbotService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

client.SendMessage({ user_message: "testing refund" }, (err, response) => {
  if (err) {
    console.error("gRPC test failed:", err);
  } else {
    console.log("Bot reply:", response.bot_reply);
  }
});

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'proto', 'chatbot.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const chatbotProto = grpc.loadPackageDefinition(packageDefinition).chatbot;

// gRPC handler function
function sendMessage(call, callback) {
  const userMsg = call.request.user_message.toLowerCase();
  let reply = "";

  if (userMsg.includes("refund")) {
    reply = "Sure, I can help with a refund. Could you please provide your order number?";
  } else {
    reply = "Thanks for your message. A support agent will be with you shortly.";
  }

  callback(null, { bot_reply: reply });
}

// Start gRPC server
function main() {
  const server = new grpc.Server();
  server.addService(chatbotProto.ChatbotService.service, { sendMessage });

  server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error("❌ Failed to bind gRPC server:", err);
      return;
    }

    server.start();
    console.log("✅ gRPC Chatbot Server running on port", port);
  });
}

main();

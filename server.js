const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'proto', 'chatbot.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const chatbotProto = grpc.loadPackageDefinition(packageDefinition).chatbot;

// 👇 This function handles what to do when the client sends a message
function sendMessage(call, callback) {
    const userMessage = call.request.user_message.toLowerCase();
    let reply;
  
    // Simulated sentiment and intent detection
    if (userMessage.includes("hello") || userMessage.includes("hi")) {
      reply = "👋 Hi there! Welcome to NodeFlix support. How can I help today?";
    } else if (
      userMessage.includes("angry") || 
      userMessage.includes("terrible") || 
      userMessage.includes("bad")
    ) {
      reply = "😔 I’m really sorry to hear that. Let me connect you with a human agent immediately.";
    } else if (userMessage.includes("refund")) {
      reply = "💸 Let’s get your refund sorted. Can you confirm your order number?";
    } else if (userMessage.includes("thank you") || userMessage.includes("thanks")) {
      reply = "😊 You're most welcome! Let me know if there's anything else I can help with.";
    } else if (userMessage.includes("cancel") || userMessage.includes("unsubscribe")) {
      reply = "🗑️ We’re sorry to see you go! Let me walk you through the cancellation steps.";
    } else {
      reply = "🤖 Hmm… I didn’t quite get that, but I’m always learning. Could you rephrase it?";
    }
  
    callback(null, { bot_reply: reply });
  }
  

// 👇 Set up the gRPC server and register the chatbot service
const server = new grpc.Server();
server.addService(chatbotProto.ChatbotService.service, { SendMessage: sendMessage });
server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), () => {
  console.log("🤖 gRPC Chatbot Server running on port 50051");
  server.start();
});

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load .proto
const livechatProtoPath = path.join(__dirname, '..', 'proto', 'livechat.proto');
const livechatDef = protoLoader.loadSync(livechatProtoPath);
const livechatProto = grpc.loadPackageDefinition(livechatDef).livechat;

// Create client
const client = new livechatProto.LiveChatService('localhost:50054', grpc.credentials.createInsecure());

// Messages the user might send
const messages = [
  "hi",
  "i am really annoyed with the service and quality of the films on Nodeflix",
  "i want to cancel my subscription"
];

// Start stream
const call = client.ChatLive();

// Simulate streaming with small delay between messages
let index = 0;
const interval = setInterval(() => {
  if (index < messages.length) {
    console.log("Sending:", messages[index]);
    call.write({ user_message: messages[index++] });
  } else {
    clearInterval(interval);
    call.end();
  }
}, 1000); // Send one message per second

// Listen for streamed replies
call.on('data', (response) => {
  console.log("Bot says:", response.bot_reply);
});

call.on('end', () => {
  console.log("Stream ended.");
});

call.on('error', (err) => {
  console.error("Stream error:", err.message);
});

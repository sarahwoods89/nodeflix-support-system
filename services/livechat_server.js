const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const fs = require('fs');

// Function to log service events
function logData(data) {
  fs.appendFile('service.log', `${new Date().toISOString()} - ${data}\n`, (err) => {
    if (err) {
      console.error('Error writing to log:', err);
    }
  });
}

const livechatProtoPath = path.join(__dirname, '..', 'proto', 'livechat.proto');
const livechatDef = protoLoader.loadSync(livechatProtoPath);
const livechatProto = grpc.loadPackageDefinition(livechatDef).livechat;

function chatLive(call) {
    logData('LiveChat service started');
  
    const responses = [
      'Hello! How can I help you today?',
      'Just checking in — do you need help with your account?',
      'Feel free to ask me anything.',
      'Thanks for chatting with Nodeflix support!'
    ];
  
    let i = 0;
    const interval = setInterval(() => {
      if (i < responses.length) {
        const response = { bot_reply: responses[i] };
        call.write(response);
        logData(`LiveChat bot sent: ${responses[i]}`);
        i++;
      } else {
        call.end();
        clearInterval(interval);
        logData('LiveChat session ended');
      }
    }, 1000);
  }
  

function main() {
  const server = new grpc.Server();
  server.addService(livechatProto.LiveChatService.service, { ChatLive: chatLive });

  server.bindAsync('127.0.0.1:50054', grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error("Failed to bind LiveChatService:", err);
      return;
    }
    server.start();
    console.log(`LiveChatService running on port ${port}`);
  });
}

main();

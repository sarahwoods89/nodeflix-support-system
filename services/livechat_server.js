const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const livechatProtoPath = path.join(__dirname, '..', 'proto', 'livechat.proto');
const livechatDef = protoLoader.loadSync(livechatProtoPath);
const livechatProto = grpc.loadPackageDefinition(livechatDef).livechat;

function chatLive(call) {
  call.on('data', (chatRequest) => {
    const msg = chatRequest.user_message;
    console.log("📥 Received from client:", msg);

    // Simulated response
    const reply = {
      bot_reply: `You said: "${msg}". How can I help further?`
    };

    call.write(reply); // Stream back the response
  });

  call.on('end', () => {
    console.log("❌ Chat ended by client");
    call.end();
  });
}

function main() {
  const server = new grpc.Server();
  server.addService(livechatProto.LiveChatService.service, { ChatLive: chatLive });

  server.bindAsync('127.0.0.1:50054', grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error("❌ Failed to bind LiveChatService:", err);
      return;
    }
    server.start();
    console.log(`🎧 LiveChatService running on port ${port}`);
  });
}

main();

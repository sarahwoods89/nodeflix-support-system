const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load sentiment.proto
const PROTO_PATH = path.join(__dirname, '../proto/sentiment.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const sentimentProto = grpc.loadPackageDefinition(packageDefinition).sentiment;

// Simulated tone analyzer
function analyzeTone(call, callback) {
  const msg = call.request.message.toLowerCase();

  let tone = "neutral";
  if (msg.includes("angry") || msg.includes("refund") || msg.includes("not happy")) {
    tone = "angry";
  } else if (msg.includes("thanks") || msg.includes("great")) {
    tone = "happy";
  }

  console.log("📥 Received for tone analysis:", msg);
  callback(null, { tone });
}

// Start gRPC server
function main() {
  const server = new grpc.Server();
  server.addService(sentimentProto.SentimentService.service, { AnalyzeTone: analyzeTone });

  server.bindAsync('127.0.0.1:50052', grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error("❌ Failed to bind sentiment service:", err);
      return;
    }

    server.start();
    console.log(`🔵 Sentiment Analysis Service running on port ${port}`);
  });
}

main();

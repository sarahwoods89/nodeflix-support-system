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

// Load sentiment.proto
const sentimentProtoPath = path.join(__dirname, '..', 'proto', 'sentiment.proto');
const sentimentDef = protoLoader.loadSync(sentimentProtoPath);
const sentimentProto = grpc.loadPackageDefinition(sentimentDef).sentiment;


// Simulated tone analyzer
function analyzeTone(call, callback) {
  const msg = (call.request.message || "").toLowerCase();
  let tone = "neutral";

  logData(`Sentiment service received: ${msg}`);

  if (msg.includes("angry") || msg.includes("refund") || msg.includes("not happy") || msg.includes("annoyed") || msg.includes("mad") || msg.includes("upset")) {
    tone = "angry";
  } else if (msg.includes("thanks") || msg.includes("great") || msg.includes("awesome") || msg.includes("good service")) {
    tone = "happy";
  }

  logData(`Tone determined: ${tone}`);
  console.log("✅ Received for tone analysis:", msg);
  
  callback(null, { tone }); // 👈 make sure to send the tone properly
}

// Start gRPC server
function main() {
  const server = new grpc.Server();
  server.addService(sentimentProto.SentimentService.service, { AnalyzeTone: analyzeTone });

  server.bindAsync('127.0.0.1:50052', grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error("Failed to bind sentiment service:", err);
      return;
    }

    server.start();
    console.log(`Sentiment Analysis Service running on port ${port}`);
  });
}

main();

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const fs = require('fs');

// Function to log services to file for debugging and auditing if needed. 
function logData(data) {
  fs.appendFile('service.log', `${new Date().toISOString()} - ${data}\n`, (err) => {
    if (err) {
      console.error('Error writing to log:', err);
    }
  });
}

// Load sentiment.proto file to run the sentiment server and what is in it.
const sentimentProtoPath = path.join(__dirname, '..', 'proto', 'sentiment.proto');
const sentimentDef = protoLoader.loadSync(sentimentProtoPath);
const sentimentProto = grpc.loadPackageDefinition(sentimentDef).sentiment;


// Simulated tone analyzer. This is the function that defines what the sentiment server can do.
// It's basically showing off it's skills that when the Nodeflix customer sends in their message, the sentiment server can analyse
// it and give a simple answer of tone detected. You have to advertise the function so that when the chatbot reaches for this 
// server on it's port, both the chatbot server and sentiment server know what is about to happen.  
function analyzeTone(call, callback) {
  const msg = (call.request.message || "").toLowerCase();
  let tone = "neutral";

  logData(`Sentiment service received: ${msg}`); //checks the message for specific words.

  if (msg.includes("angry") || msg.includes("refund") || msg.includes("not happy") || msg.includes("annoyed") || msg.includes("mad") || msg.includes("upset")) {
    tone = "angry";
  } else if (msg.includes("thanks") || msg.includes("great") || msg.includes("awesome") || msg.includes("good service")) {
    tone = "happy";
  }

  logData(`Tone determined: ${tone}`);
  console.log("✅ Received for tone analysis:", msg);
  
  callback(null, { tone }); // sends the tone detected back to the cahtbot server. To clarify that "this customer is aaaangry grrr"
}

// Start the sentiment_server. You've the sentiment server running on its port and awaiting some requests to come in. 
//The function above shows waht the sentiment server can do. Like a coffee machine, you know that it can make coffee. 
//unitl a request comes in for one, you won't run the function/press the start button on the machine. 
function main() {
  const server = new grpc.Server();
  //register the analyse tone method under the sentiment service.
  server.addService(sentimentProto.SentimentService.service, { AnalyzeTone: analyzeTone });
  //bind server to port 5052.
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

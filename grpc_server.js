//services/grpc_server.js
// This is your main chatbot server now extended to talk to the sentiment and ticketing services.

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

// Load chatbot proto
const chatbotProtoPath = path.resolve(__dirname, 'proto/chatbot.proto');
console.log('Looking for chatbot.proto at:', chatbotProtoPath);
const chatbotDef = protoLoader.loadSync(chatbotProtoPath);
const chatbotProto = grpc.loadPackageDefinition(chatbotDef).chatbot;

// Load sentiment proto
const sentimentProtoPath = path.join(__dirname, 'proto', 'sentiment.proto');
const sentimentDef = protoLoader.loadSync(sentimentProtoPath);
const sentimentProto = grpc.loadPackageDefinition(sentimentDef).sentiment;

// Load ticketing proto
const ticketingProtoPath = path.join(__dirname, 'proto', 'ticketing.proto');
const ticketingDef = protoLoader.loadSync(ticketingProtoPath);
const ticketingProto = grpc.loadPackageDefinition(ticketingDef).ticketing;

// Connect to other services
const sentimentClient = new sentimentProto.SentimentService('localhost:50052', grpc.credentials.createInsecure());
const ticketingClient = new ticketingProto.TicketingService('localhost:50053', grpc.credentials.createInsecure());

// Chatbot logic
function getBotReply(call, callback) {
  const userMsg = call.request.user_message;
  console.log('Received from user:', userMsg);

  // DEBUG LOGGING SENTIMENT CALL
  console.log('Sending to sentiment service:', { message: userMsg });

  logData(`Chatbot received message: ${userMsg}`);

  sentimentClient.AnalyzeTone({ message: userMsg }, (err, response) => {
    if (err) {
      console.error('Error contacting Sentiment Service:', err.message);
      return callback(null, { bot_reply: 'Sorry, I couldn’t analyze the message tone.' });
    }

    // DEBUG LOGGING SENTIMENT RESPONSE
    console.log('Response from sentiment service:', response);

    const tone = response.tone;
    console.log('Detected tone:', tone);

    let reply = `Tone detected: ${tone}. `;

    if (tone === 'angry' || tone === 'frustrated') {
      let timeoutFired = false;

      // Safety net: if no ticket end, still reply after 3s
      const timeout = setTimeout(() => {
        timeoutFired = true;
        reply += ' [Timeout fallback] Your issue has been escalated.';
        return callback(null, { bot_reply: reply });
      }, 3000); // 3 seconds

      ticketingClient.CreateTicket({ user_message: userMsg })
        .on('data', (ticketUpdate) => {
          console.log("📋 Ticket update:", ticketUpdate.status);
        })
        .on('end', () => {
          if (!timeoutFired) {
            clearTimeout(timeout);
            reply += ' Your issue has been escalated. A support agent will contact you shortly.';
            return callback(null, { bot_reply: reply });
          }
        })
        .on('error', (err) => {
          if (!timeoutFired) {
            clearTimeout(timeout);
            console.error('Ticketing stream error:', err.message);
            reply += ' But I couldn’t create a ticket.';
            return callback(null, { bot_reply: reply });
          }
        });
    } else {
      // Neutral or happy tone
      reply += 'How can I assist you further?';
      return callback(null, { bot_reply: reply });
    }
  });
}

// Start gRPC server and show a similar intro to Netflix. This was purely to try and dazzle you for extra points :)
function main() {
  console.clear();
  console.log('\x1b[41m\x1b[30m', '══════════════════════════════════════════════════════════════');
  console.log('\x1b[41m\x1b[30m', '                    NODEFLIX SUPPORT SYSTEM                   ');
  console.log('\x1b[41m\x1b[30m', '══════════════════════════════════════════════════════════════');
  console.log('\x1b[0m'); // Reset to default terminal colors

  const server = new grpc.Server();
  server.addService(chatbotProto.ChatbotService.service, { SendMessage: getBotReply });

  server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Failed to bind chatbot server:', err);
      return;
    }
    server.start();
    console.log(`✅ Chatbot Server running on port ${port}`);
  });
}

main();

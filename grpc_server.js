// services/grpc_server.js
// Main chatbot server connecting to sentiment and ticketing services.This server is sort of like the mother of all servers. 
// It knows what is happening and knows which server does what and who to call on in different scenarios. 

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const fs = require('fs');

// Function to log service events to a file which is useful for debugging and data logging. 
function logData(data) {
  fs.appendFile('service.log', `${new Date().toISOString()} - ${data}\n`, (err) => {
    if (err) {
      console.error('Error writing to log:', err);
    }
  });
}

// Load chatbot proto. The proto buffer files are your easy to read go to manual. These .proto files lay out what the corresponding
// servers do, how they do it, what language or data type they expect. It's like getting a toy and an instruction manual with it. 
const chatbotProtoPath = path.resolve(__dirname, 'proto/chatbot.proto');
console.log('Looking for chatbot.proto at:', chatbotProtoPath);
const chatbotDef = protoLoader.loadSync(chatbotProtoPath);
const chatbotProto = grpc.loadPackageDefinition(chatbotDef).chatbot;

// Load sentiment proto. Remember the .proto files are like your manual. Loading them allows the server to read them and ensure
// that ther server knows exactly how they will operate. In this case, we want this loaded so when a customer messages us, we
// can reach for the service that will analyse the tone.
const sentimentProtoPath = path.join(__dirname, 'proto', 'sentiment.proto');
const sentimentDef = protoLoader.loadSync(sentimentProtoPath);
const sentimentProto = grpc.loadPackageDefinition(sentimentDef).sentiment;

// Load ticketing proto. Let's us access the .proto to generate a ticket for a customer if needed. 
const ticketingProtoPath = path.join(__dirname, 'proto', 'ticketing.proto');
const ticketingDef = protoLoader.loadSync(ticketingProtoPath);
const ticketingProto = grpc.loadPackageDefinition(ticketingDef).ticketing;

// Connect to other services that are running on other local hosts. think of it like they are on a phone line, waiting for the 
// call to help with what they offer. 
const sentimentClient = new sentimentProto.SentimentService('localhost:50052', grpc.credentials.createInsecure());
const ticketingClient = new ticketingProto.TicketingService('localhost:50053', grpc.credentials.createInsecure());

// Chatbot logic to receive a message from a customer and give a response to that customer. 
function getBotReply(call, callback) {
  const userMsg = call.request.user_message || "";
  console.log('Received from user:', userMsg);

  logData(`Chatbot received message: ${userMsg}`);
  //this is where we ask the sentiment server to analyse the tone of the message the chatbot server has received. 
  sentimentClient.AnalyzeTone({ message: userMsg }, (err, response) => {
    if (err) {
      console.error('Error contacting Sentiment Service:', err.message);
      return callback(null, { bot_reply: 'Sorry, I couldn’t analyze the message tone.' });
    }

    const tone = response.tone || "neutral";  // Fallback if empty.
    console.log('Detected tone:', tone);

    let reply = `Tone detected: ${tone}. `;
    //create a ticekt to escalate the issue.
    if (tone === 'angry' || tone === 'frustrated') {
      let timeoutFired = false;
      //Create a fallback if the ticekt creation laggs, that the chatbot server isn't affected.
      const timeout = setTimeout(() => {
        timeoutFired = true;
        reply += ' [Timeout fallback] Your issue has been escalated.';
        return callback(null, { bot_reply: reply });
      }, 3000);
      //create the ticket once sentiment server has confirmed an annoyed/angry tone. 
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
      // For neutral or happy tones
      reply += 'How can I assist you further?';
      return callback(null, { bot_reply: reply });
    }
  });
}


// Start gRPC server and bind it to the port 5051. This server, like the others, are running and listening out for others
// to call upon them, to then start to execute the functions they've set out. The ports are liek theri phoen numbers, in 
// Ireland we have 086, 087, 085 mobile numbers. My phoen sits on an 086 line for example. When a server needs another microservice 
// it knows where to call it (the port numebr) and when the function is called, it's liek that port number rings out, for the 
// other microservice to answer it's call and fulfill that function that's been called.  
function main() {
  console.clear();
  console.log('\x1b[41m\x1b[30m', '══════════════════════════════════════════════════════════════');
  console.log('\x1b[41m\x1b[30m', '                    NODEFLIX SUPPORT SYSTEM                   ');
  console.log('\x1b[41m\x1b[30m', '══════════════════════════════════════════════════════════════');
  console.log('\x1b[0m'); // Reset colors

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

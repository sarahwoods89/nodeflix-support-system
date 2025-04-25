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

// Load ticketing.proto
const ticketingProtoPath = path.join(__dirname, '..', 'proto', 'ticketing.proto');
const ticketingDef = protoLoader.loadSync(ticketingProtoPath);
const ticketingProto = grpc.loadPackageDefinition(ticketingDef).ticketing;

function createTicket(call) {
  const message = call.request.user_message;
  console.log("🎫 Ticket created for:", message);

  logData(`Ticketing service received: ${message}`);

  const updates = [
    { status: "Ticket received", timestamp: new Date().toISOString() },
    { status: "Assigned to support agent", timestamp: new Date().toISOString() },
    { status: "In progress", timestamp: new Date().toISOString() },
    { status: "Resolved", timestamp: new Date().toISOString() },
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (i < updates.length) {
      call.write(updates[i]);
      i++;
    } else {
      const ticketStatus = updates[updates.length - 1].status;
      logData(`Ticket status sent: ${ticketStatus}`);    
      call.end();
      clearInterval(interval);
    }
  }, 1000);
}

// Start gRPC server
function main() {
  const server = new grpc.Server();
  server.addService(ticketingProto.TicketingService.service, { CreateTicket: createTicket });

  server.bindAsync('127.0.0.1:50053', grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error("❌ Failed to bind ticketing service:", err);
      return;
    }

    server.start();
    console.log(`🟠 Ticketing Service running on port ${port}`);
  });
}

main();

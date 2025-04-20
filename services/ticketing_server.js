const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load ticketing.proto
const PROTO_PATH = path.join(__dirname, '../proto/ticketing.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const ticketingProto = grpc.loadPackageDefinition(packageDefinition).ticketing;

function createTicket(call) {
  const message = call.request.user_message;
  console.log("🎫 Ticket created for:", message);

  // Simulate streaming status updates
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
      call.end();
      clearInterval(interval);
    }
  }, 1000); // stream every 1 second
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

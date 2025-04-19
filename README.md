Features Implemented

GUI (Express + EJS)

Chat interface running at http://localhost:3000

Displays user input and chatbot replies

gRPC Architecture

Defined service using proto/chatbot.proto

Unary RPC implemented via SendMessage method

Server hosted at localhost:50051

Chatbot Logic

Responds to keywords like refund

Can be extended with more message handling logic

Integration

app.js acts as the client

grpc_server.js hosts the gRPC server

Chat messages are passed from frontend to gRPC via Express

Testing

grpc_test.js allows testing gRPC service independently

Work In Progress

To Do:



How to Run Locally

1. Start the gRPC Server

node grpc_server.js

2. Start the Express App

node app.js

Visit http://localhost:3000

Folder Structure

├── proto
│   └── chatbot.proto          # gRPC service definition
├── views
│   └── index.ejs              # Chat interface view
├── grpc_server.js             # gRPC backend logic
├── app.js                     # Express GUI & gRPC client
├── grpc_test.js               # Simple client to test gRPC directly

🎓 CA Requirements Covered



Built With

Node.js

Express

gRPC

ProtoLoader

EJS




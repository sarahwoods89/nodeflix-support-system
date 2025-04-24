# Nodeflix Support System

A gRPC-powered customer support chatbot for **Nodeflix**, a fictional blockchain-based movie rental platform. This project is part of my Distributed Systems coursework at the National College of Ireland. All credit for this idea, which I wanted to base it around for my own brain to help me fully understand and be able to convey that I know waht I'm talking about in my presentation video, is to a company called FLINK - the OG Web3 rental platform - helping more stories be shared. 

-  AI-style chatbot that replies to user messages
-  Sentiment analysis to detect user tone
-  Ticketing system for escalating angry/frustrated users
-  Supports **all four types of gRPC**:
  - ✅ Unary
  - ✅ Server Streaming
  - ✅ Client Streaming
  - ✅ Bidirectional Streaming

---

## Tech Stack

- **Node.js**
- **gRPC with Protocol Buffers**
- **Express.js** (for GUI)
- **EJS** (templating engine)
- Custom `.proto` files defining each service

---

## Project Structure

nodeflix-support-system/ │ 
├── proto/ # .proto definitions │ 
  ├── chatbot.proto │ 
  ├── sentiment.proto │ 
  ├── ticketing.proto │ 
  └── livechat.proto │ 
├── services/ 
# gRPC microservices │ 
  ├── grpc_server.js
# Main chatbot gRPC server │ 
  ├── sentiment_server.js │ 
  ├── ticketing_server.js │ 
  ├── livechat_server.js │ 
  ├── clients/ # Streaming test clients │ 
  └── livechat_client.js │ 
├── views/ # Express GUI (EJS templates) │ 
  └── index.ejs │ 
  ├── app.js # Express GUI server 
  └── README.md

  
---

## Getting Started

### 1. Clone the Repo
 
git clone https://github.com/your-username/nodeflix-support-system.git
cd nodeflix-support-system

### 2. Install dependencies

npm install

### 3. Start all services

node services/sentiment_server.js
node services/ticketing_server.js
node services/livechat_server.js
node services/grpc_server.js
node app.js

### 4. Test livechat for bi-directional and client scripting

node clients/livechat_client.js


Author: Sarah Woods
Student ID: x23170662
National College of Ireland
Distributed Systems Coursework (2025)








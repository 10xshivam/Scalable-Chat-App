// import http from 'http'
// import SocketService from './services/socket'
// import { startConsuming } from './services/kafka'

// async function init() {
//     startConsuming()
//     const socketService = new SocketService()

//     const httpServer = http.createServer()
//     const PORT = process.env.PORT || 8000

//     socketService.io.attach(httpServer)

//     httpServer.listen(PORT,() => {
//         console.log("HTTP Server started at PORT:",PORT)
//     })

//     socketService.initListeners()
// }

// init()

import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import SocketService from "./services/socket";
import { startConsuming } from "./services/kafka";

dotenv.config();

async function init() {
    startConsuming(); // Start Kafka consumer

    const app = express();
    const server = http.createServer(app);
    const socketService = new SocketService();

    const PORT = process.env.PORT || 8000;

    // Enable CORS
    app.use(
        cors({
            origin: "https://scalable-chat-app-web-lyart.vercel.app", // Allow frontend origin
            methods: ["GET", "POST"],
            allowedHeaders: ["Content-Type"],
            credentials: true, // Important for WebSockets
        })
    );

    app.get("/", (req, res) => {
        res.send("Socket.io Server Running");
    });

    // Attach Socket.IO to the HTTP server
    socketService.io.attach(server);

    server.listen(PORT, () => {
        console.log(`🚀 Server started at PORT: ${PORT}`);
    });

    socketService.initListeners();
}

init();

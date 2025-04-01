import { Server } from "socket.io";
import Redis from 'ioredis';
import prismaClient from "./prisma";
import { produceMessage } from "./kafka";
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

const redisConfig = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD
};

const pub = new Redis(redisConfig);
const sub = new Redis(redisConfig);

class SocketService {
    private _io:Server
    
    constructor(){
        console.log("Init Socket Service")
        this._io = new Server({
            cors: {
                origin: "https://scalable-chat-app-web-lyart.vercel.app", // Allow Frontend
                methods: ["GET", "POST"],
                allowedHeaders: ["Content-Type", "Authorization"],
                credentials: true,
            },
        })
        sub.subscribe("MESSAGES")
    }

    get io(){
        return this._io;
    }

    public initListeners(){
        const io = this._io
        console.log("Init Socket Listeners...")

        io.on("connect",(socket) => {
            console.log("New Socket connected", socket.id)
            socket.on("event:message", async ({message}:{message:string})=>{
                console.log("New message received ",message)
                // publish this message to redis
                await pub.publish("MESSAGES",JSON.stringify({message}))
            })
        })
        sub.on('message',async (channel,message) => {
            console.log("new message from redis",message)
            if(channel==='MESSAGES'){
                io.emit('message',message)
                await produceMessage(message)
                console.log('Message Produced to Kafka Broker')
            }
        })
    }

}

export default SocketService;
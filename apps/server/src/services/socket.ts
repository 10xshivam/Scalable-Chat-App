import { Server } from "socket.io";
import Redis from 'ioredis'


const pub = new Redis({
    host: 'valkey-2c30c332-chatapp-90a2.f.aivencloud.com',
    port: 27888,
    username: 'default',
    password: 'AVNS_YkTje2rq1-nXPFkNHTl'
})
const sub = new Redis({
    host: 'valkey-2c30c332-chatapp-90a2.f.aivencloud.com',
    port: 27888,
    username: 'default',
    password: 'AVNS_YkTje2rq1-nXPFkNHTl'
})

class SocketService {
    private _io:Server
    
    constructor(){
        console.log("Init Socket Service")
        this._io = new Server({
            cors:{
                allowedHeaders:['*'],
                origin:'*'
            }
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
            if(channel==='MESSAGES'){
                io.emit('message',message)
            }
        })
    }

}

export default SocketService;
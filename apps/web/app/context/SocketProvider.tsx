"use client"
import React, { useCallback, useEffect, useContext, useState } from "react"
import { io, Socket } from "socket.io-client"

interface SocketProviderProps {
    children?:React.ReactNode
}

interface ISocketContext {
    sendMessage:(msg:string) => any;
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
    const state =  useContext(SocketContext);
    if(!state) throw new Error('state is undefined')

    return state;
}

export const SocketProvider:React.FC<SocketProviderProps> = ({children}) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    
    const sendMessage:ISocketContext['sendMessage'] = useCallback((msg) => {
        console.log("Send Message", msg);
        if(socket) {
            socket.emit('event:message', {message:msg});
        }
    },[socket])

    const onMessageRec = useCallback((msg:string)=>{
        console.log("From Server Msg Rec", msg)
    },[])

    useEffect(() => {
        const _socket = io('http://localhost:8000');
        setSocket(_socket);

        _socket.on('message',onMessageRec)

        return () => {
            _socket.off('message',onMessageRec)
            _socket.disconnect()
            setSocket(null);
        }
    },[])
    
    return (
        <SocketContext.Provider value={{ sendMessage }}>
            {children}
        </SocketContext.Provider>
    )
}
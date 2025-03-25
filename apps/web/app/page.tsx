"use client"
import React, { useState } from 'react'
import classes from './page.module.css'
import { useSocket } from './context/SocketProvider'

export default function Page() {
  const {sendMessage} = useSocket();
  const [message,setMessage] = useState("")
  return (
    <div className={classes['container']}>
      <div>
        <h1>All messages will appear here</h1>
      </div>
      <div>
        <input onChange={(e)=> setMessage(e.target.value)} className={classes['chat-input']} placeholder='Message...'/>
        <button onClick={(e)=>sendMessage(message)} className={classes['btn']}>Send</button>
      </div>
    </div>
  )
}


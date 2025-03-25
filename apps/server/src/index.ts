import http from 'http'
import SocketService from './services/socket'
import { startConsuming } from './services/kafka'

async function init() {
    startConsuming()
    const socketService = new SocketService()

    const httpServer = http.createServer()
    const PORT = process.env.PORT || 8000

    socketService.io.attach(httpServer)

    httpServer.listen(PORT,() => {
        console.log("HTTP Server started at PORT:",PORT)
    })

    socketService.initListeners()
}

init()
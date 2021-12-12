import { WebSocketServer } from 'ws'
import {v4 as uuid} from 'uuid'
import  {writeFile} from 'fs'
const clients = {}
const wss = new WebSocketServer({port: 8000});

const messages = []

wss.on('connection', (ws) => {
    const id = uuid();
    clients[id] = ws;

    console.log(`new client ${id}`)
    ws.send(JSON.stringify(messages))

    ws.on('message', (fetchMessage) => {

        const {name,message} = JSON.parse(fetchMessage)
        messages.push({name,message})
        for (const id in clients) {
            clients[id].send(JSON.stringify([{name,message}]))
        }
    })

    ws.on('close', () => {
        delete clients[id];
        console.log(`delete client ${id}`)
    })
})

process.on("SIGINT", () => {
    wss.close();
    writeFile('log', JSON.stringify(messages), err => {
        if (err) {
            console.log(err)
        }
        process.exit()
    })
})
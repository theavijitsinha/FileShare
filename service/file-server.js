// TODO The message handling is the same for file server and peer connection.
// See if it can be moved to a single location.

module.exports = {}

const eventHandler = require('./event-handler.js')
const Constant = require('./constant.js')

const ClientConnection = require('../data_type/client-connection.js')

const net = require('net')

let socketIP = Constant.FILE_SERVER_IP
let socketPort = Constant.FILE_SERVER_PORT

let server = null
let clientConnections = {}

module.exports.startFileServer = function () {
  server = net.createServer()
  server.on('connection', connectionHandler)
  server.on('error', (err) => {
    console.log(`File Server Error:\n${err.stack}`)
    server.close()
  })
  server.on('listening', () => {
    const address = server.address()
    console.log(`File Server Listening ${address.address}:${address.port}`)

    eventHandler.emit(Constant.Event.FILE_SERVER_STARTED)
  })
  server.on('close', () => {
    console.log(`File Server Closed`)
  })
  server.listen(socketPort, socketIP)
}

module.exports.stopFileServer = function () {
  server.close()
}

function connectionHandler (socket) {
  clientConnections[socket.address().address] = new ClientConnection(socket)
}

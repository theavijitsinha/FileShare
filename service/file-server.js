// TODO The message handling is the same for file server and peer connection.
// See if it can be moved to a single location.

module.exports = {}

const eventHandler = require('./event-handler.js')
const Constants = require('./constants.js')

const EventEmitter = require('events')
const net = require('net')

let socketIP = Constants.FILE_SERVER_IP
let socketPort = Constants.FILE_SERVER_PORT

let server = null

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

    eventHandler.emit(Constants.EVENT_FILE_SERVER_STARTED)
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
  let buffer = ''
  let address = socket.address()
  console.log(`Client Connected ${address.address}`)
  socket.on('end', () => {
    console.log(`Client Disconnected ${address.address}`)
  })
  let messageEventHandler = new EventEmitter()
  socket.on('data', dataHandler)
  messageEventHandler.on(Constants.EVENT_FILE_SERVER_MESSAGE, messageHandler)

  function dataHandler (data) {
    buffer = buffer + data
    let pattern = /^([^\r\n]+)[\r\n]+([\s\S]*)$/
    let bufferMatch = buffer.match(pattern)
    if (bufferMatch !== null) {
      let message = bufferMatch[1]
      buffer = bufferMatch[2]
      messageEventHandler.emit(Constants.EVENT_FILE_SERVER_MESSAGE, message)
    }
  }

  function messageHandler (message) {
    console.log(`File Server Received Message : ${message}`)
  }
}

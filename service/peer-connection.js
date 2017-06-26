const Constants = require('./constants.js')

const net = require('net')
const EventEmitter = require('events')

let socketPort = Constants.FILE_SERVER_PORT

class PeerConnection {
  constructor (serverNode) {
    let self = this
    this.buffer = ''
    this.client = new net.Socket()
    this.client.connect(socketPort, serverNode.ip, function () {
      console.log(`Client Connected To ${serverNode.name} (${serverNode.ip})`)
    })
    this.client.on('close', function () {
      console.log(`Client Disconnected From ${serverNode.name} (${serverNode.ip})`)
    })
    this.messageEventHandler = new EventEmitter()
    this.client.on('data', dataHandler)
    this.messageEventHandler.on(Constants.EVENT_FILE_CLIENT_MESSAGE, messageHandler)

    function dataHandler (data) {
      self.buffer = self.buffer + data
      let pattern = /^([^\r\n]+)[\r\n]+([\s\S]*)$/
      let bufferMatch = self.buffer.match(pattern)
      if (bufferMatch !== null) {
        let message = bufferMatch[1]
        self.buffer = bufferMatch[2]
        self.messageEventHandler.emit(Constants.EVENT_FILE_CLIENT_MESSAGE, message)
      }
    }

    function messageHandler (message) {
      console.log(`Client Received Message : ${message}`)
    }
  }

  sendMessage (messageString) {
    messageString = messageString + '\n'
    this.client.write(messageString)
  }

  disconnect () {
    this.client.destroy()
  }
}

module.exports = PeerConnection

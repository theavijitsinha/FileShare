const Constants = require('../service/constants.js')

const Connection = require('./connection.js')

const net = require('net')

let socketPort = Constants.FILE_SERVER_PORT

class PeerConnection extends Connection {
  constructor (serverNode) {
    super(new net.Socket())
    this.socket.connect(socketPort, serverNode.ip, function () {
      console.log(`Client Connected To ${serverNode.name} (${serverNode.ip})`)
    })
    this.socket.on('close', function () {
      console.log(`Client Disconnected From ${serverNode.name} (${serverNode.ip})`)
    })
  }

  messageHandler (message) {
    console.log(`Client Received Message : ${message}`)
  }

  disconnect () {
    this.socket.destroy()
  }
}

module.exports = PeerConnection

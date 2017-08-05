const Constants = require('../service/constants.js')

const Connection = require('./connection.js')
const Message = require('./message.js')

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

  fetchFileTree () {
    let message = new Message('get_file_tree')
    this.sendMessage(message)
  }
}

module.exports = PeerConnection

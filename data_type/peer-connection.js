const Constants = require('../service/constants.js')

const Connection = require('./connection.js')
const Message = require('./message.js')

const net = require('net')

let socketPort = Constants.FILE_SERVER_PORT

class PeerConnection extends Connection {
  constructor (serverNode) {
    super(new net.Socket())
    this.fileTree = null
    this.serverNode = serverNode
    this.socket.connect(socketPort, serverNode.ip, this.connectionHandler.bind(this))
    this.socket.on('close', function () {
      console.log(`Client Disconnected From ${serverNode.name} (${serverNode.ip})`)
    })
  }

  connectionHandler () {
    console.log(`Client Connected To ${this.serverNode.name} (${this.serverNode.ip})`)
    this.fetchFileTree()
  }

  messageHandler (message) {
    console.log(`Client Received Message : ${message.data}`)
    if (message.head === 'file_tree') {
      this.fileTree = message.data
    }
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

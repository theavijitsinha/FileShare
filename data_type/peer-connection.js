const Constant = require('../service/constant.js')
const subprocess = require('../service/subprocess.js')

const Connection = require('./connection.js')
const Message = require('./message.js')

const net = require('net')

let socketPort = Constant.FILE_SERVER_PORT

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
    console.log(`Client Received Message`)
    console.log(message)
    if (message.head === Message.Type.FILE_TREE) {
      this.fileTree = message.data
    }
  }

  disconnect () {
    this.socket.destroy()
  }

  fetchFileTree () {
    let message = new Message(Message.Type.GET_FILE_TREE)
    this.sendMessage(message)
  }

  requestFileDownload (fileNode) {
    subprocess.get(subprocess.Name.FILE_TRANSFER).send(
      new Message(Message.Type.START_FILE_RECEIVE, {
        'fileReceiveRequest': {
          'id': fileNode.id,
          'nodePath': fileNode.nodePath,
          'size': fileNode.size
        },
        'address': this.serverNode.ip
      }))
    let message = new Message(Message.Type.PACKET_SIZE_REQUEST, {
      'fileId': 0,
      'id': fileNode.id,
      'nodePath': fileNode.nodePath
    })
    this.sendMessage(message)
  }
}

module.exports = PeerConnection

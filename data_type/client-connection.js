const Connection = require('./connection.js')
const Message = require('./message.js')

const fileWatcher = require('../service/file-watcher.js')
const deviceInfo = require('../service/device-info.js')
const subprocess = require('../service/subprocess.js')

/**
 * Handle clients connected to the file server
 */
class ClientConnection extends Connection {
  constructor (socket) {
    super(socket)
    this.address = socket.address()
    console.log(`Client Connected ${this.address.address}`)
    this.socket.on('end', () => {
      console.log(`Client Disconnected ${this.address.address}`)
    })

    this.sendServerInfo()
  }

  messageHandler (message) {
    console.log(`Message received from ${this.address.address}`)
    console.log(message)
    if (message.head === Message.Type.GET_FILE_TREE) {
      this.sendFileTree()
    } else if (message.head === Message.Type.PACKET_SIZE_REQUEST) {
      let absolutePath = fileWatcher.getAbsolutePath(message.data.id, message.data.nodePath)
      subprocess.get(subprocess.Name.FILE_TRANSFER).send(
        new Message(Message.Type.START_FILE_SEND, {
          'fileSendRequest': {
            'fileId': message.data.fileId,
            'absolutePath': absolutePath
          },
          'address': this.address.address
        }))
    }
  }

  sendFileTree () {
    let message = new Message(Message.Type.FILE_TREE, fileWatcher.getPublicTree())
    this.sendMessage(message)
  }

  sendServerInfo () {
    let message = new Message(Message.Type.SERVER_INFO, deviceInfo.getInfoObject())
    this.sendMessage(message)
  }
}

module.exports = ClientConnection

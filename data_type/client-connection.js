const Connection = require('./connection.js')
const Message = require('./message.js')

const fileWatcher = require('../service/file-watcher.js')
const deviceInfo = require('../service/device-info.js')

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
    console.log(`Message received from ${this.address.address}\n${message.data}`)
    if (message.head === 'get_file_tree') {
      this.sendFileTree()
    }
  }

  sendFileTree () {
    let message = new Message('file_tree', fileWatcher.getPublicTree())
    this.sendMessage(message)
  }

  sendServerInfo () {
    let message = new Message('server_info', deviceInfo.getInfoObject())
    this.sendMessage(message)
  }
}

module.exports = ClientConnection

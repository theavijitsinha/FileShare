const Connection = require('./connection.js')

const fileWatcher = require('../service/file-watcher.js')

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
  }

  messageHandler (message) {
    console.log(`Message received from ${this.address.address}\n${message}`)
    }
  }

  }
}

module.exports = ClientConnection

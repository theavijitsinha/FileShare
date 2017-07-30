/**
 * Handle clients connected to the file server
 */
class ClientConnection {
  constructor (socket) {
    this.socket = socket
    this.buffer = ''
    this.address = socket.address()
    console.log(`Client Connected ${this.address.address}`)
    this.socket.on('end', () => {
      console.log(`Client Disconnected ${this.address.address}`)
    })
    this.socket.on('data', this.dataHandler.bind(this))
  }

  /**
   * Split the data received into messages and call messageHandler for each
   * message
   */
  dataHandler (data) {
    this.buffer = this.buffer + data
    let pattern = /^([^\r\n]+)[\r\n]+([\s\S]*)$/
    let bufferMatch = this.buffer.match(pattern)
    if (bufferMatch !== null) {
      let message = bufferMatch[1]
      this.buffer = bufferMatch[2]
      this.messageHandler(message)
    }
  }

  messageHandler (message) {
    console.log(`File Server Received message from ${this.address.address} : ${message}`)
  }
}

module.exports = ClientConnection

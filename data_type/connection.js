class Connection {
  constructor (socket) {
    this.buffer = ''
    this.socket = socket
    this.socket.on('data', this.dataHandler.bind(this))
  }

  dataHandler (data) {
    this.buffer = this.buffer + data
    let pattern = /^([^\r\n]+)[\r\n]+([\s\S]*)$/
    let bufferMatch = this.buffer.match(pattern)
    while (bufferMatch !== null) {
      let message = bufferMatch[1]
      this.buffer = bufferMatch[2]
      this.messageHandler(JSON.parse(message))
      bufferMatch = this.buffer.match(pattern)
    }
  }

  messageHandler (message) {
  }

  sendMessage (message) {
    let messageString = message.getString() + '\n'
    this.socket.write(messageString)
  }
}

module.exports = Connection

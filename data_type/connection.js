class Connection {
  constructor (socket) {
    this.buffer = ''
    this.socket = socket
    this.socket.on('data', dataHandler.bind(this))

    function dataHandler (data) {
      this.buffer = this.buffer + data
      let pattern = /^([^\r\n]+)[\r\n]+([\s\S]*)$/
      let bufferMatch = this.buffer.match(pattern)
      if (bufferMatch !== null) {
        let message = bufferMatch[1]
        this.buffer = bufferMatch[2]
        this.messageHandler(JSON.parse(message))
      }
    }
  }

  messageHandler (message) {
  }

  sendMessage (messageString) {
    messageString = messageString + '\n'
    this.socket.write(messageString)
  }
}

module.exports = Connection

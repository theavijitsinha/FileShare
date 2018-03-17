const Message = require('./message.js')

class FileTransferMessage extends Message {
  constructor (head, data) {
    super(head, data)
    if (head === Message.Type.FILE_RECEIVE_REQUEST) {
      this.data = Buffer.alloc(1 + (4 * data.chunks.length))
      this.data[0] = data.fileId
      for (let i = 0; i < data.chunks.length; i++) {
        let chunkId = data.chunks[i]
        this.data[(4 * i) + 1] = chunkId >> 24
        this.data[(4 * i) + 2] = chunkId >> 16
        this.data[(4 * i) + 3] = chunkId >> 8
        this.data[(4 * i) + 4] = chunkId
      }
    } else if (head === Message.Type.PACKET_SIZE) {
      this.data = Buffer.alloc(1 + 2)
      this.data[0] = data.fileId
      this.data[1] = data.packetSize >> 8
      this.data[2] = data.packetSize
    } else if (head === Message.Type.FILE_CHUNK) {
      this.data = Buffer.alloc(data.chunk.length + 5)
      this.data[0] = data.fileId
      this.data[1] = data.chunkId >>> 24
      this.data[2] = data.chunkId >>> 16
      this.data[3] = data.chunkId >>> 8
      this.data[4] = data.chunkId
      data.chunk.copy(this.data, 5)
    }
  }

  static decode (packet) {
    let message = super.decode(packet)
    let data = null
    if (message.head === Message.Type.FILE_RECEIVE_REQUEST) {
      data = {
        'fileId': message.data[0],
        'chunks': []
      }
      for (let i = 1; i < message.data.length; i = i + 1) {
        data.chunks.push(
          (message.data[i] << 24) +
          (message.data[i + 1] << 16) +
          (message.data[i + 2] << 8) +
          (message.data[i + 3]))
      }
    } else if (message.head === Message.Type.PACKET_SIZE) {
      data = {
        'fileId': message.data[0],
        'packetSize': (message.data[1] << 8) + message.data[2]
      }
    } else if (message.head === Message.Type.FILE_CHUNK) {
      data = {
        'fileId': message.data[0],
        'chunkId':
          (message.data[1] << 24) +
          (message.data[2] << 16) +
          (message.data[3] << 8) +
          (message.data[4]),
        'chunk': message.data.slice(5)
      }
    }
    return new Message(message.head, data)
  }
}

module.exports = FileTransferMessage

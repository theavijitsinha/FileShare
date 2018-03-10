class Message {
  constructor (head, data) {
    this.head = head
    this.data = data
  }

  packet () {
    let data = null
    let isBuffer = null
    if (Buffer.isBuffer(this.data)) {
      data = this.data
      isBuffer = true
    } else {
      data = Buffer.from(JSON.stringify(this.data))
      isBuffer = false
    }
    let buffer = Buffer.from([this.head, +isBuffer])
    return Buffer.concat([buffer, data])
  }

  string () {
    return JSON.stringify(this)
  }

  static decode (packet) {
    let head = packet[0]
    let isBuffer = (packet[1] === 1)
    let data = packet.slice(2)
    if (!isBuffer) {
      data = JSON.parse(data.toString())
    }
    return new Message(head, data)
  }
}

Message.Type = {
  'SERVER_INFO': 1,
  'GET_FILE_TREE': 2,
  'FILE_TREE': 3,
  'START_FILE_RECEIVE': 4,
  'START_FILE_SEND': 5,
  'PACKET_SIZE_REQUEST': 6,
  'PACKET_SIZE': 7,
  'FILE_RECEIVE_REQUEST': 8,
  'FILE_CHUNK': 9
}

module.exports = Message

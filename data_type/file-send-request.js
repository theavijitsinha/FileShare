const Message = require('./message.js')
const FileTransferMessage = require('./file-transfer-message.js')

const fileTransfer = require('../service/file-transfer.js')

const fs = require('fs-extra')

let FILE_MAX_PACKET_SIZE = 1465
let SEND_TIMEOUT = 2000
let State = {
  'SEND_REQUEST_CREATED': 1,
  'SEND_STARTED': 2,
  'SEND_STOPPED': 3
}

class FileSendRequest {
  constructor (peerFileId, filePath, receiverAddress) {
    this.peerFileId = peerFileId
    this.filePath = filePath
    this.size = fs.statSync(filePath).size
    this.chunks = []
    this.receiverAddress = receiverAddress
    this.state = State.SEND_REQUEST_CREATED
    console.log('Sender state: SEND_REQUEST_CREATED')
    this.fd = null
    this.readCount = 0
    this.sendExpireTimer = null
  }

  initialize (filePath) {
    if (this.state === State.SEND_REQUEST_CREATED) {
      this.packetSizeSent = false
    }
  }

  equals (peerFileId, receiverAddress) {
    return this.peerFileId === peerFileId && this.receiverAddress === receiverAddress
  }

  startFileSend (chunks) {
    this.chunks = chunks.slice()
    this.state = State.SEND_STARTED
    console.log('Sender state: SEND_STARTED')
    this.fd = fs.openSync(this.filePath, 'r')
    if (this.sendExpireTimer) {
      clearTimeout(this.sendExpireTimer)
    }
    this.sendExpireTimer = setTimeout(() => {
      this.state = State.SEND_STOPPED
      console.log('Sender state: SEND_STOPPED')
    }, SEND_TIMEOUT)
  }

  handle () {
    if (this.state === State.SEND_REQUEST_CREATED) {
      if (!this.packetSizeSent) {
        let message = new FileTransferMessage(Message.Type.PACKET_SIZE, {
          'fileId': this.peerFileId,
          'packetSize': FILE_MAX_PACKET_SIZE
        })
        fileTransfer.sendMessage(message, this.receiverAddress)
      }
      this.packetSizeSent = true
    } else if (this.state === State.SEND_STARTED) {
      if (this.chunks.length) {
        let chunkId = this.chunks.shift()
        let chunk = Buffer.alloc(FILE_MAX_PACKET_SIZE)
        this.readCount++
        fs.read(this.fd, chunk, 0, FILE_MAX_PACKET_SIZE, chunkId * FILE_MAX_PACKET_SIZE, () => {
          this.readCount--
          let message = new FileTransferMessage(Message.Type.FILE_CHUNK, {
            'fileId': this.peerFileId,
            'chunkId': chunkId,
            'chunk': chunk
          })
          fileTransfer.sendMessage(message, this.receiverAddress)
        })
      }
    } else if (this.state === State.SEND_STOPPED) {
      if (this.readCount === 0) {
        fs.closeSync(this.fd)
        return false
      }
    }
    return true
  }
}

module.exports = FileSendRequest

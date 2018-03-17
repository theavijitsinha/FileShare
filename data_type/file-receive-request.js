const Message = require('./message.js')
const FileTransferMessage = require('./file-transfer-message.js')

const fileTransfer = require('../service/file-transfer.js')

const fs = require('fs-extra')
const path = require('path')

let MAX_EXPECTED_CHUNKS_LENGTH = 350
let State = {
  'RECEIVE_REQUEST_CREATED': 1,
  'DOWNLOAD_STARTED': 2,
  'DOWNLOAD_COMPLETE': 3
}

class FileReceiveRequest {
  constructor (fileId, fileNode, senderAddress) {
    this.fileId = fileId
    this.baseId = fileNode.id
    this.relativePath = fileNode.nodePath

    let settingsFile = path.join(__dirname, '../settings/user.json')
    let settings = fs.readJsonSync(settingsFile)
    this.downloadPath = path.join(settings.defaultDownloadPath, this.relativePath)

    this.size = fileNode.size
    this.senderAddress = senderAddress
    this.state = State.RECEIVE_REQUEST_CREATED
    console.log('Receiver state: RECEIVE_REQUEST_CREATED')
    this.packetSize = 0
    this.expectedChunks = []
    this.nextLeastChunk = 0
    this.maxChunk = 0
    fs.ensureFileSync(this.downloadPath)
    this.fd = fs.openSync(this.downloadPath, 'r+')
    fs.ftruncateSync(this.fd, this.size)
    this.writeCount = 0
    this.numChunksPerCycle = 0
  }

  equals (fileId, senderAddress) {
    return this.fileId === fileId && this.senderAddress === senderAddress
  }

  handleFileChunk (chunkId, chunk) {
    let chunkIndex = this.expectedChunks.indexOf(chunkId)
    if (chunkIndex !== -1) {
      this.numChunksPerCycle++
      let chunkBuf = Buffer.from(chunk, 'ascii')
      this.writeCount++
      fs.write(this.fd, chunkBuf, 0, chunkBuf.length, chunkId * this.packetSize, () => {
        this.writeCount--
      })
      this.expectedChunks.splice(chunkIndex, 1)
      this.addSingleExpectedChunk()
      if (this.expectedChunks.length === 0) {
        this.state = State.DOWNLOAD_COMPLETE
        console.log('Receiver state: DOWNLOAD_COMPLETE')
        console.log(this.numChunksPerCycle)
        this.numChunksPerCycle = 0
      }
    }
  }

  handle () {
    if (this.state === State.DOWNLOAD_STARTED) {
      console.log(this.numChunksPerCycle)
      this.numChunksPerCycle = 0
      let message = new FileTransferMessage(Message.Type.FILE_RECEIVE_REQUEST, {
        'fileId': this.fileId,
        'chunks': this.expectedChunks
      })
      fileTransfer.sendMessage(message, this.senderAddress)
    } else if (this.state === State.DOWNLOAD_COMPLETE) {
      if (this.writeCount === 0) {
        fs.closeSync(this.fd)
        return false
      }
    }
    return true
  }

  updatePacketSize (packetSize) {
    this.state = State.DOWNLOAD_STARTED
    console.log('Receiver state: DOWNLOAD_STARTED')
    this.packetSize = packetSize
    this.maxChunk = Math.floor((this.size - 1) / packetSize)
    while (this.expectedChunks.length < MAX_EXPECTED_CHUNKS_LENGTH && this.addSingleExpectedChunk()) {}
  }

  addSingleExpectedChunk () {
    if (this.nextLeastChunk > this.maxChunk) {
      return false
    } else {
      this.expectedChunks.push(this.nextLeastChunk)
      this.nextLeastChunk++
      return true
    }
  }
}

FileReceiveRequest.decodeChunkData = function (chunkData) {
  return {
    'fileId': chunkData[0],
    'chunkId': (chunkData[1] << 24) + (chunkData[2] << 16) + (chunkData[3] << 8) + (chunkData[4]),
    'chunk': chunkData.slice(5)
  }
}

module.exports = FileReceiveRequest

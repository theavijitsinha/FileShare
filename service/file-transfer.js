const FileSendRequest = require('../data_type/file-send-request.js')
const FileReceiveRequest = require('../data_type/file-receive-request.js')
const Message = require('../data_type/message.js')
const FileTransferMessage = require('../data_type/file-transfer-message.js')

const dgram = require('dgram')
const process = require('process')

let socketIP = '0.0.0.0'
let socketPort = 9001

let server = null
let sendQueue = []
let receiveQueue = []

process.on('message', (message) => {
  if (message.head === Message.Type.START_FILE_RECEIVE) {
    startFileReceive(message.data.fileReceiveRequest, message.data.address)
  } else if (message.head === Message.Type.START_FILE_SEND) {
    startFileSend(message.data.fileSendRequest, message.data.address)
  }
})

startTransferServer()

function handleReceiveQueue () {
  for (let i = receiveQueue.length - 1; i >= 0; i--) {
    if (!receiveQueue[i].handle()) {
      receiveQueue.splice(i, 1)
    }
  }
}
setInterval(handleReceiveQueue, 500)

function handleSendQueue () {
  for (let i = sendQueue.length - 1; i >= 0; i--) {
    if (!sendQueue[i].handle()) {
      sendQueue.splice(i, 1)
    }
  }
}
setInterval(handleSendQueue, 0)

function getSendRequest (peerFileId, receiverAddress) {
  for (let curRequest of sendQueue) {
    if (curRequest.equals(peerFileId, receiverAddress)) {
      return curRequest
    }
  }
  return null
}

function getReceiveRequest (fileId, senderAddress) {
  for (let curRequest of receiveQueue) {
    if (curRequest.equals(fileId, senderAddress)) {
      return curRequest
    }
  }
  return null
}

function startFileSend (fileSendRequest, address) {
  let absolutePath = fileSendRequest.absolutePath
  let curRequest = getSendRequest(fileSendRequest.fileId, address)
  if (!curRequest) {
    curRequest = new FileSendRequest(fileSendRequest.fileId, absolutePath, address)
    sendQueue.push(curRequest)
  }
  curRequest.initialize()
}

function startFileReceive (fileNode, address) {
  receiveQueue.push(new FileReceiveRequest(0, fileNode, address))
}

function startTransferServer () {
  server = dgram.createSocket('udp4')

  server.on('error', (err) => {
    console.log(`File Transfer Server Error:\n${err.stack}`)
    server.close()
  })

  server.on('message', messageHandler)

  server.on('listening', () => {
    console.log(`File Transfer Server Started`)
  })

  server.on('close', () => {
    console.log(`File Transfer Server Stopped`)
  })

  server.bind(socketPort, socketIP)
}

function messageHandler (msg, rinfo) {
  let message = FileTransferMessage.decode(msg)
  if (message.head === Message.Type.FILE_RECEIVE_REQUEST) {
    updateSendRequestChunks(message.data, rinfo.address)
  } else if (message.head === Message.Type.PACKET_SIZE) {
    handlePacketSize(message.data, rinfo.address)
  } else if (message.head === Message.Type.FILE_CHUNK) {
    handleFileChunk(message.data, rinfo.address)
  }
}

module.exports.sendMessage = function (message, address) {
  server.send(message.packet(), socketPort, address)
}

function updateSendRequestChunks (message, address) {
  let curRequest = getSendRequest(message.fileId, address)
  if (curRequest) {
    curRequest.startFileSend(message.chunks)
  }
}

function handlePacketSize (message, address) {
  let curRequest = getReceiveRequest(message.fileId, address)
  if (curRequest) {
    curRequest.updatePacketSize(message.packetSize)
  }
}

function handleFileChunk (message, address) {
  let curRequest = getReceiveRequest(message.fileId, address)
  if (curRequest) {
    curRequest.handleFileChunk(message.chunkId, message.chunk)
  }
}

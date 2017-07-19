module.exports = {}

const EventEmitter = require('events')

let eventHandler = new EventEmitter()

module.exports.emit = function (eventName, ...args) {
  eventHandler.emit(eventName, ...args)
}

module.exports.listen = function (eventName, listener) {
  eventHandler.addListener(eventName, listener)
}

module.exports.unlisten = function (eventName, listener) {
  eventHandler.removeListener(eventName, listener)
}

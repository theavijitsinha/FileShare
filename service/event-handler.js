module.exports = {}

const EventEmitter = require('events')

let eventHandler = new EventEmitter()

module.exports.emit = function (eventName, ...args) {
  eventHandler.emit(eventName, ...args)
}

module.exports.listen = function (eventName, listener) {
  eventHandler.on(eventName, listener)
}

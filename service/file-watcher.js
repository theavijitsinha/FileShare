module.exports = {}

const Tree = require('../data_type/tree.js')

const eventHandler = require('./event-handler.js')
const Constants = require('./constants.js')

const chokidar = require('chokidar')
const path = require('path')

let watcher = null
let fileTree = null

module.exports.startFileWatcher = function () {
  fileTree = new Tree()
  let sharedPaths = []

  sharedPaths.push(path.resolve('./shared1'))
  sharedPaths.push(path.resolve('./shared2'))

  watcher = chokidar.watch(sharedPaths, {ignored: /(^|[/\\])\../})
  .on('addDir', function (path) {
    fileTree.addNode(path, Tree.NodeType.DIR_NODE)
  })
  .on('add', function (path) {
    fileTree.addNode(path, Tree.NodeType.FILE_NODE)
  })
  .on('unlinkDir', function (path) {
    fileTree.deleteNode(path)
  })
  .on('unlink', function (path) {
    fileTree.deleteNode(path)
  })

  eventHandler.emit(Constants.EVENT_FILE_WATCHER_STARTED)
}

module.exports.stopFileWatcher = function () {
  if (watcher !== null) {
    watcher.close()
    watcher = null
    eventHandler.emit(Constants.EVENT_FILE_WATCHER_STOPPED)
  }
}

module.exports.fileTree = fileTree

module.exports = {}

const Tree = require('../data_type/tree.js')

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
}

module.exports.stopFileWatcher = function () {
  if (watcher !== null) {
    watcher.close()
    watcher = null
  }
}

module.exports.fileTree = fileTree

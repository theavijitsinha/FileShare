const path = require('path')
const fs = require('fs-extra')

/**
 * Node of the tree, representing a single file/directory (except root node)
 */
class Node {
  constructor (nodePath, nodeType, id) {
    this.nodePath = nodePath
    this.children = []
    this.nodeType = nodeType
    this.id = id

    if (nodeType === Tree.NodeType.ROOT_NODE) {
      this.name = 'root'
    } else {
      this.name = path.basename(nodePath)
    }
  }
}

class FileNode extends Node {
  constructor (nodePath, nodeType, id) {
    super(nodePath, nodeType, id)
    this.size = fs.statSync(nodePath).size
  }
}

/**
 * Tree structure of user's shared files
 */
class Tree {
  constructor () {
    this.root = new Node('', Tree.NodeType.ROOT_NODE, 0)
  }

  addNode (nodePath, nodeType, id) {
    let curNode
    let matchChild = this.root
    do {
      curNode = matchChild
      matchChild = null
      for (let i = 0; i < curNode.children.length; i++) {
        let child = curNode.children[i]
        if (!path.relative(child.nodePath, nodePath).startsWith('..')) {
          matchChild = child
          break
        }
      }
    } while (matchChild !== null)
    if (curNode.nodePath !== nodePath) {
      switch (nodeType) {
        case Tree.NodeType.BASE_DIR_NODE:
          curNode.children.push(new Node(nodePath, nodeType, id))
          break
        case Tree.NodeType.FILE_NODE:
          curNode.children.push(new FileNode(nodePath, nodeType, curNode.id))
          break
        default:
          curNode.children.push(new Node(nodePath, nodeType, curNode.id))
      }
    }
  }

  deleteNode (nodePath) {
    let curNode, prevNode
    let matchChild = this.root
    do {
      prevNode = curNode
      curNode = matchChild
      matchChild = null
      for (let i = 0; i < curNode.children.length; i++) {
        let child = curNode.children[i]
        if (!path.relative(child.nodePath, nodePath).startsWith('..')) {
          matchChild = child
          break
        }
      }
    } while (matchChild !== null)
    if (curNode.nodePath === nodePath) {
      let index = prevNode.children.indexOf(curNode)
      prevNode.children.splice(index, 1)
      this.deleteNodeRecursive(curNode)
    }
  }

  deleteNodeRecursive (curNode) {
    for (let i = 0; i < curNode.children.length; i++) {
      this.deleteNodeRecursive(curNode.children[i])
    }
    curNode.children = []
  }

  /**
   * Delete all nodes (except root node) from the tree
   */
  clearTree () {
    this.deleteNodeRecursive(this.root)
  }

  relativePaths (returnJSON = false) {
    let treeJSON = JSON.stringify(this, (key, value) => {
      if (key === 'nodePath') {
        for (let child of this.root.children) {
          let relativePath = path.relative(child.nodePath, value)
          if (!relativePath.startsWith('..')) {
            return relativePath
          }
        }
      }
      return value
    })
    return returnJSON ? treeJSON : JSON.parse(treeJSON)
  }

  baseDirPath (id) {
    for (let child of this.root.children) {
      if (child.id === id) {
        return child.nodePath
      }
    }
  }
}

Tree.NodeType = {
  FILE_NODE: 'file_node',
  DIR_NODE: 'directory_node',
  BASE_DIR_NODE: 'base_directory_node',
  ROOT_NODE: 'root_node'
}

module.exports = Tree

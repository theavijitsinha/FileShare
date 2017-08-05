/**
 * Node of the tree, representing a single file/directory (except root node)
 */
class Node {
  constructor (path, nodeType) {
    this.path = path
    this.children = []
    this.nodeType = nodeType

    if (nodeType === Tree.NodeType.ROOT_NODE) {
      this.name = 'root'
    } else {
      this.name = path.match(/[\\/]?([^\\/]+)[\\/]?$/)[1]
    }
  }
}

/**
 * Tree structure of user's shared files
 */
class Tree {
  constructor () {
    this.root = new Node('', Tree.NodeType.ROOT_NODE)
  }

  addNode (path, nodeType) {
    let curNode
    let matchChild = this.root
    do {
      curNode = matchChild
      matchChild = null
      for (let i = 0; i < curNode.children.length; i++) {
        let child = curNode.children[i]
        if (path.startsWith(child.path)) {
          matchChild = child
          break
        }
      }
    } while (matchChild !== null)
    if (curNode.path !== path) {
      curNode.children.push(new Node(path, nodeType))
    }
  }

  deleteNode (path) {
    let curNode, prevNode
    let matchChild = this.root
    do {
      prevNode = curNode
      curNode = matchChild
      matchChild = null
      for (let i = 0; i < curNode.children.length; i++) {
        let child = curNode.children[i]
        if (path.startsWith(child.path)) {
          matchChild = child
          break
        }
      }
    } while (matchChild !== null)
    if (curNode.path === path) {
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
}

Tree.NodeType = {
  FILE_NODE: 'file_node',
  DIR_NODE: 'directory_node',
  ROOT_NODE: 'root_node'
}

module.exports = Tree

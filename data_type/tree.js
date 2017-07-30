/**
 * Node of the tree, representing a single file/directory (except root node)
 */
class Node {
  constructor (path, parent, nodeType) {
    this.path = path
    this.children = []
    this.parent = parent
    this.nodeType = nodeType

    if (parent === null) {
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
    this.root = new Node('', null, Tree.NodeType.ROOT_NODE)
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
      curNode.children.push(new Node(path, curNode, nodeType))
    }
  }

  deleteNode (path) {
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
    if (curNode.path === path) {
      let index = curNode.parent.children.indexOf(curNode)
      curNode.parent.children.splice(index, 1)
      this.deleteNodeRecursive(curNode)
    }
  }

  deleteNodeRecursive (curNode) {
    for (let i = 0; i < curNode.children.length; i++) {
      this.deleteNodeRecursive(curNode.children[i])
    }
    curNode.parent = null
    curNode.children = []
  }

  /**
   * Delete all nodes (except root node) from the tree
   */
  clearTree () {
    this.deleteNodeRecursive(this.root)
  }

  /**
   * Get array representation of file tree
   */
  getArrayObject (curNode = this.root) {
    let arrayObj = []
    arrayObj.push(curNode.name)
    if (curNode.nodeType === Tree.NodeType.ROOT_NODE || curNode.nodeType === Tree.NodeType.DIR_NODE) {
      let childrenArray = []
      for (let i = 0; i < curNode.children.length; i++) {
        let child = curNode.children[i]
        childrenArray = childrenArray.concat(this.getArrayObject(child))
      }
      arrayObj.push(childrenArray)
    }

    return arrayObj
  }
}

Tree.NodeType = {
  FILE_NODE: 'file_node',
  DIR_NODE: 'directory_node',
  ROOT_NODE: 'root_node'
}

module.exports = Tree

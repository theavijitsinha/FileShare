class Message {
  constructor (head, data) {
    this.head = head
    this.data = data
  }

  getString () {
    return JSON.stringify(this)
  }
}

module.exports = Message

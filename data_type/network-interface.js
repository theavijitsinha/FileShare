class NetworkInterface {
  constructor (name, address, netmask) {
    this.name = name
    this.address = address
    this.netmask = netmask
  }

  getMulticastAddress () {
    let addressSplit = this.address.split('.')
    let netmaskSplit = this.netmask.split('.')
    let multicastAddress = ''
    for (let i = 0; i < addressSplit.length; i++) {
      let addressSegment = (parseInt(addressSplit[i]) | (~parseInt(netmaskSplit[i]))) & 0b11111111
      multicastAddress = multicastAddress + addressSegment + '.'
    }
    return multicastAddress.slice(0, multicastAddress.length - 1)
  }
}

module.exports = NetworkInterface

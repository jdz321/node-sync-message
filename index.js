const getId = () => Math.random()

const MESSAGE_REGEXP = /^NODE_SyncCall_(.+)$/

function syncCall(data, target) {
  const id = getId()
  target.send({
    cmd: `NODE_SyncCall_${id}`,
    data,
  })
  return new Promise((resolve, reject) => {
    const callback = (msg) => {
      if (msg.cmd === `NODE_SyncCallback_${id}`) {
        target.removeListener('internalMessage', callback)
        resolve(msg.data)
      }
    }
    target.on('internalMessage', callback)
  })
}

class SyncMessage {
  static master(cp) {
    return new SyncMessage(cp)
  }
  static child() {
    return new SyncMessage()
  }
  constructor(target = process) {
    this.target = target
    target.on('internalMessage', this.initListener.bind(this))
  }
  async initListener(msg) {
    const match = msg.cmd.match(MESSAGE_REGEXP)
    if (!match) {
      return
    }
    const [, id] = match
    const res = await this.onMessage(msg.data)
    this.target.send({
      cmd: `NODE_SyncCallback_${id}`,
      data: res,
    })
  }
  async onMessage() {}
  send(data) {
    return syncCall(data, this.target)
  }
}

module.exports = SyncMessage

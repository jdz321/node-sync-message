const CALL_PREFIX = 'NODE_SyncCall_'
const CALLBACK_PREFIX = 'NODE_SyncCallback_'

const MESSAGE_REGEXP = new RegExp(`^${CALL_PREFIX}(.+)$`)

const getId = () => Math.random()

const getCallbackCmd = id => `${CALLBACK_PREFIX}${id}`

function syncCall(data, target) {
  const id = getId()
  target.send({
    cmd: `${CALL_PREFIX}${id}`,
    data,
  })
  return new Promise((resolve, reject) => {
    const callback = (msg) => {
      if (msg.cmd === getCallbackCmd(id)) {
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
      cmd: getCallbackCmd(id),
      data: res,
    })
  }
  async onMessage() {}
  send(data) {
    return syncCall(data, this.target)
  }
}

module.exports = SyncMessage

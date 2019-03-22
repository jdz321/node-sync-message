const { delayReject } = require('./delay')

const CALL_PREFIX = 'NODE_SyncCall_'
const CALLBACK_PREFIX = 'NODE_SyncCallback_'

const MESSAGE_REGEXP = new RegExp(`^${CALL_PREFIX}(.+)$`)

const getId = () => Math.random()

const getCallbackCmd = id => `${CALLBACK_PREFIX}${id}`

function syncCall(data, target, { timeout }, cb) {
  const id = getId()
  let completeFlag = false

  const callback = (msg) => {
    if (msg.cmd === getCallbackCmd(id)) {
      completeFlag = true
      target.removeListener('internalMessage', callback)
      cb(null, msg.data)
    }
  }

  const errorCallback = (err) => {
    if (completeFlag) {
      return
    }
    if (err) {
      completeFlag = true
      target.removeListener('internalMessage', callback)
      cb(err)
    }
  }

  if (Number.isInteger(timeout) && timeout > 0) {
    delayReject(timeout).catch(errorCallback)
  }

  target.on('internalMessage', callback)

  try {
    target.send({
      cmd: `${CALL_PREFIX}${id}`,
      data,
    }, errorCallback)
  } catch (err) {
    errorCallback(err)
  }
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
    target.on('internalMessage', this.__onPrivateMessage.bind(this))
    this.send = this.send.bind(this)
  }
  async __onPrivateMessage(msg) {
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
  send(...args) {
    let [data, options = {}, cb] = args
    if (args.length === 2 && typeof options === 'function') {
      cb = options
      options = {}
    }
    if (typeof cb === 'function') {
      syncCall(data, this.target, options, cb)
      return void 0
    }
    return new Promise((resolve, reject) => {
      syncCall(data, this.target, options, (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
  }
}

module.exports = SyncMessage

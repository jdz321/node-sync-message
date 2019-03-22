const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout))

module.exports = delay

module.exports.default = delay

module.exports.delayReject = (timeout, message = "timeout") =>
  new Promise((_, reject) =>
    setTimeout(() => {
      reject(new Error(message))
    }, timeout)
  )

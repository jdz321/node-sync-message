const syncMessageChild = require('./index').child()
const log = require('./log')('child')

log('child');

process.on('message', async (msg) => {
  log(`child receive message: ${msg}`)
})

async function callParent() {
  const result = await syncMessageChild.send('who am i')

  log('receive answer: ', result) 
}

setTimeout(callParent, 2000)

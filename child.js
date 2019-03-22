const syncMessageChild = require('./index').child()
const log = require('./log')('child')
const delay = require('./delay')

process.on('message', async (msg) => {
  log(`child receive message: ${msg}`)
})

async function callParent() {
  const result1 = await syncMessageChild.send('who am i')

  log('receive answer: ', result1) 

  await delay(2000)

  const result2 = await syncMessageChild.send('bye')

  log('receive answer: ', result2)
}

async function cpsCallParent() {
  log('--- test cps style ---') 
  syncMessageChild.send('bye', (err, result1) => {
    log('receive answer: ', result1) 
  })
}

!(async () => {
  await delay(2000)
  await callParent()
  await delay(2000)
  await cpsCallParent()
  await delay(2000)
  process.exit(0)
})()

module.exports = (cat) => (...args) => {
  console.log(`[${cat}]`, ...args)
}

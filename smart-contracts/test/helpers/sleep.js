module.exports = {
  sleep: async function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },
  sleepTime: 20000, // 20 seconds
}

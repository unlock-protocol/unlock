let x = 0

const delayPromise = jest.fn(ms => {
  if (x--) {
    return Promise.resolve(ms)
  } else {
    return Promise.reject()
  }
})

delayPromise.reset = (to = 0) => {
  x = to
}

module.exports = {
  delayPromise,
}

function makeFakeScripts(scripts) {
  return scripts.map(src => ({
    getAttribute() {
      return src
    }
  }))
}

export default function mockdoc(
  scripts = ['first', 'second/static/paywall.js'],
  lock = 'lockid',
  monitorGEBT = () => { },
  monitorQS = () => { },
  monitorChild = () => { },
  monitorIframe = () => { },
  setIframe = () => { }
) {
  return {
    getElementsByTagName() {
      monitorGEBT()
      return makeFakeScripts(scripts)
    },
    querySelector() {
      monitorQS()
      if (!lock) return {
        getAttribute() {
          return undefined
        }
      }
      return {
        getAttribute() {
          return lock
        }
      }
    },
    createElement() {
      const iframe = {
        setAttribute(attr, value) {
          monitorIframe(attr, value)
        },
        style: {}
      }
      setIframe(iframe)
      return iframe
    },
    body: {
      appendChild(child) {
        monitorChild(child, 'append')
      },
      removeChild(child) {
        monitorChild(child, 'remove')
      }
    }
  }
}
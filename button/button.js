const lockedNode = document.querySelector('[data-unlock-address]')

let params = ['address', 'symbol', 'amount'].map((attribute) => {
  value = lockedNode.getAttribute(`data-unlock-${attribute}`)
  return `${attribute}=${encodeURIComponent(value)}`
}).join('&')

var src = 'http://127.0.0.1:3000'
var s = document.createElement('iframe')
src += `/iframe.html?${params}`

// Style for the iframe: cover everything!
s.setAttribute('style', 'display:block; position:fixed; top:0px; left:0px; width:100%; height:100%; border:0px; background: transparent; z-index: 2147483647');
s.setAttribute('src', src);
var loaded = false;

// Append the iframe!
document.getElementsByTagName('body')[0].appendChild(s);

// Listens to message coming from iframe 
window.addEventListener("message", (event) => {
  if (event.data === 'unlocked') {
    // let's remove the iframe!
    console.log('Content has been unlocked!')
    document.getElementsByTagName('body')[0].removeChild(s);
    if (parentArticleNode) {
      parentArticleNode.appendChild(unlockedArticleNode)
    }
  } else {
    lock()
  }
}, false);

// Asks the iframe whether the content should be locked!
s.contentWindow.postMessage('locked?', '*');

let unlockedArticleNode, parentArticleNode
function lock() {
  // Let's delete the content of the article!
  let articleNode = document.querySelector('article')
  parentArticleNode = articleNode.parentNode
  unlockedArticleNode = articleNode.cloneNode(true)
  articleNode.parentNode.removeChild(articleNode)

  // We should now show a modal to ask the user to unlock the content
  // And once the user 'submits', just 
}

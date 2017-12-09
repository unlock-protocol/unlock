# Button

The button is a JS snippet which erases the content of the page based on the status of the current visitor. Visitor has unlocked? Keep copntent. Visited has not unlocked, hide/erase content and yield to the iframe so that the user can unlock the content.

This snippet is expected to change very rarely so it can (and should!) be cached very aggressively to provide a good user experience (no flickering).

It loads some required data from the page on which it is embeded:

* The ethereum address of the paywall (a publisher can have an unlimited number of paywalls...)
* The DOM element which needs to be locked.

Once it is embedded on a page, it should load an iframe from the main unlock website. This iframe is transparent and covers the whole page. 
The button then listens to the iframe via `postMessage` to eventually remove itself when the content has been unlocked.



  <script>

   var paywallId = 123456789 // Ethereum contract address!

    var src = 'http://127.0.0.1:8080'
    var s = document.createElement('iframe')
    src += '/iframe.html?paywall=' + encodeURIComponent(paywallId)

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
</script>


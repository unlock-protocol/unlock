---
title: Integrating Unlock with React
subTitle: Our Javascript API is very easy to integrate with React!
authorName: Julien Genestoux
publishDate: July 10, 2019
description: Integrating Unlock with React is straighforward! Here's a quick tutorial on how to get there!
image: /images/blog/react-integration/react-logo.png
latestUpdateDate: April 6, 2020
---

React is one of the main JavaScript front end frameworks. Unlock's JavaScript API provides an easy way for any creator to restrict access to content or features.

Here is a tutorial on how to integrate Unlock in your react application. We will create an React application (using [create-react-app](https://github.com/facebook/create-react-app)) which will show the user whether they own a key (unlocked!), or if they need to purchase one (locked). The [code for the application is on Github](https://github.com/unlock-protocol/react-example); you can try it yourself directly on the [corresponding github page](https://unlock-protocol.github.io/react-example/).

We will assume you have already created a react application and that application should behave differently based on whether the user is a member or not.

1. Include the Unlock snippet

We do that by changing the `index.html` (main HTML template) of our application. The following snippet is added the the `<head>` section:

```
<script> (function (d, s) {
    var js = d.createElement(s),
      sc = d.getElementsByTagName(s)[0];
    js.src = "https://paywall.unlock-protocol.com/unlock.latest.min.js";
    sc.parentNode.insertBefore(js, sc);
  }(document, "script"));
</script>
```

Note: this loading technique is non blocking, which means this does not have any performance impact on rendering.

2. Add the configuration

The snippet inserted above needs to know which lock are used on this page. For this example, we will use a single lock, the one that is already being used on that blog.

```
<script>
  var unlockProtocolConfig = {
    locks: {
      '0xb77030a7e47a5eb942a4748000125e70be598632': {
        name: 'The Unlock Members lock',
        network: 137,
      },
    },
    icon: 'https://unlock-protocol.com/images/svg/unlock-word-mark.svg'
  }
</script>
```

3. Writing the component which listens to Unlock

React components can have their own local state (which can be passed down to their children components). Here, our state will likely include a `locked` key. The value associated with that key can be any of the 3 following:

- `locked`
- `unlocked`
- `pending`

The `pending` state allows us to not show to the use a "flash" when toggling between the 2 other state. When the page loads, we do not know right away whether the state should be locked or unlocked. Fortunately though, the unlock JavaScript API is very fast (we cache a lot of data) to make sure that, in the vast majority of cases, the user will actually not witness the `pending` state.

```
constructor(props) {
  super(props)
  this.state = {
    locked: "pending" // there are 3 state: pending, locked and unlocked
  }
}
```

React's component have lifecycle methods which let developers integrate with JavaScript API calls. Unlock uses the `window.addEventListener` API to trigger an `unlockProtocol` in order to indicate the state of the lock for the current visitor, so our component needs to implement the following method when it is mounted:

```
componentDidMount() {
  window.addEventListener("unlockProtocol", this.unlockHandler)
}
```

Note: `this.unlockHandler` will be implemented below.

Similarly, when the component is to be removed, we want to perform some cleanup to avoid wasting the browser's resources.

```
componentWillUnmount() {
  window.removeEventListener("unlockProtocol", this.unlockHandler)
}
```

We need to add our `unlockHandler` in the constructor:

```
constructor(props) {
  super(props)
  this.unlockHandler = this.unlockHandler.bind(this)
  this.state = {
    locked: "pending" // there are 3 state: pending, locked and unlocked
  }
}
```

And we also implement it by using React's `setState` method. Unlock will emit either `locked` or `unlocked`.

```
unlockHandler(e) {
  this.setState(state => {
    return {
      ...state,
      locked: e.detail
    }
  })
}
```

When the state is `locked`, we want to let the user purchase a key. For this, we use the modal provided by the Unlock JavaScript API, but you could very well implement that logic yourself (it would require tinkering with the web3 providers though...)

```
checkout() {
  window.unlockProtocol && window.unlockProtocol.loadCheckoutModal()
}
```

Now that we have the state and ways to invoke a key purchase, we can easily render based on it. This is probably where your app's logic will likely diverge the most, but here is what we did for our demo application:

- if the content is locked, we show a 🔒, anc clicking on it will open the checkout model.
- if the content is unlocked, we show a 🗝!

```
render() {
  const { locked } = this.state
  return (
    <div className="App">
      <header className="App-header">
        {locked === "locked" && (
          <div onClick={this.checkout} style={{ cursor: "pointer" }}>
            Unlock me!{" "}
            <span aria-label="locked" role="img">
              🔒
            </span>
          </div>
        )}
        {locked === "unlocked" && (
          <div>
            Unlocked!{" "}
            <span aria-label="unlocked" role="img">
              🗝
            </span>
          </div>
        )}
      </header>
    </div>
  )
}
```

## Conclusion

Unlock's JavaScript API is very simple and will get out of the way to let you implement behaviors that your application requires.

If the status of the lock is re-used in several components, it might be a good idea to isolate that logic in a single one and pass the state as props to sub-components!

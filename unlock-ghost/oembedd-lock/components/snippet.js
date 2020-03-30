export default function Snippet(props) {
    return (`
    <button id='unlock'>Unlock content</button>
    <script>
    var unlockProtocolConfig = {
    	locks: {
    	  "${props.lock}": {
          name: "${props.name}"
    	  }, // your lock goes here
    	},
    	icon: 'https://staging-app.unlock-protocol.com/static/images/svg/default.svg',
    	callToAction: {
    	  default: 'This content is locked. Pay with cryptocurrency to access it!'
      }
    }
    <\/script>
    <script src='${process.env.serverURL}/static/unlock-ghost.js'><\/script>`
  );
}
import url from 'url'
import {buildLocks} from "../../utils";

const OEmbedSnippet = (locks) => {
  const formattedLocks = locks.reduce((locksObj, lock) => {
    locksObj[lock.address] = {
      name: lock.name
    }
    return locksObj;
  }, {});
  console.log(locks)
  console.log(formattedLocks)
  return `
<button id='unlock' style="background-color: #ff6771; font-size: 16px; color: #ffffff; cursor: pointer; height: 48px; border-width: initial; border-style: none;border-color: initial;border-image: initial;border-radius: 4px;outline: none;transition: background-color 200ms ease 0s;padding: 10px;">Unlock content</button>
<script>
  var unlockProtocolConfig = { 
    locks: ${JSON.stringify(formattedLocks)},
    icon: 'https://staging-app.unlock-protocol.com/static/images/svg/default.svg',
    callToAction: {
      default: 'This content is locked. Pay with cryptocurrency to access it!'
    }
  }
</script>
<script src='${ process.env.serverURL }/static/unlock-ghost.js'></script>
`};

export default (req, res) => {
  const query = url.parse(req.url,true).query;
  const locks = buildLocks( typeof query.locks === 'string' ? [query.locks] : (query.locks || []));
  const response = {
    type: "rich",
    provider_name: "Unlock",
    provider_url: process.env.serverURL,
    version: "1.0",
    cache_age: "10000",
    width: 500,
    height: 70,
    html: OEmbedSnippet(locks)
  };

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(response))
}
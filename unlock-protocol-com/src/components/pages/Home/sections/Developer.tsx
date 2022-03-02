import { TabbedCodeBox, Button } from '@unlock-protocol/ui'
import { UNLOCK_LINKS } from '../../../../config/constants'
import { Link } from '../../../helpers/Link'

const CODE_BLOCKS: React.ComponentProps<typeof TabbedCodeBox>['blocks'] = [
  {
    code: `
<script>
  function loadUnlock(node, script) {
    const js = node.createElement(script);
    const sc = d.getElementsByTagName(script)[0];
    
    js.src="https://paywall.unlock-protocol.com/static/unlock.latest.min.js";  
    sc.parentNode.insertBefore(js, sc);
  }

  loadUnlock(document, "script");
</script>
    
<script>
  var unlockProtocolConfig = {
    // paywallConfig object 
  }
</script>`.trim(),
    lang: 'javascript',
    name: 'Web',
  },
  {
    code: `
import configureUnlock from "@unlock-protocol/unlock-express"
const app = express()

const { membersOnly } = configureUnlock({
  async yieldPaywallConfig() {
    return {}
  }
  async getUserEthereumAddress(req) {
    return req.cookies.userAddress
  },
  async updateUserEthereumAddress(req, res, address, signature, message) {
    res.cookie('userAddress', address)
  },
}
}, app)

app.get('/members', membersOnly(), (req, res) => res.send('Secret stuff! <a href="/logout">logout</a>'))
    `.trim(),
    lang: 'javascript',
    name: 'Backend',
  },
]

export function Developer() {
  return (
    <section className="flex flex-col justify-center p-6 mx-auto max-w-7xl sm:justify-between gap-y-6 gap-x-16 sm:items-center sm:flex-row">
      <div className="flex flex-col max-w-lg gap-4 sm:gap-6">
        <header>
          <h1 className="heading">Developers, we have you covered.</h1>
        </header>
        <div>
          <p className="sub-heading">
            Unlock is a protocol - not a platform. It&apos;s free to use,
            community-owned and governed, and offers limitless customization.
          </p>
        </div>
        <div>
          <Button>
            <Link href={UNLOCK_LINKS.developers}>Visit our docs</Link>
          </Button>
        </div>
      </div>
      <div className="max-w-sm sm:max-w-lg">
        <TabbedCodeBox blocks={CODE_BLOCKS} />
      </div>
    </section>
  )
}

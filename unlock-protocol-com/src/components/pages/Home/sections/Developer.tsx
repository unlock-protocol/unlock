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
    <section className="flex max-w-6xl mx-auto p-6 flex-col justify-center sm:justify-between gap-y-6 gap-x-16 sm:items-center sm:flex-row">
      <div className="flex flex-col gap-4 sm:gap-6 max-w-sm">
        <header>
          <h3 className="text-3xl font-bold sm:text-5xl max-w-[220px] sm:max-w-none">
            You&apos;re a dev? We got this.
          </h3>
        </header>
        <div>
          <p className="text-lg sm:text-xl text-brand-gray">
            We&apos;re a protocol - not a platform. We&apos;re free,
            community-owned, and possess limitless opportunities for
            customization.
          </p>
        </div>
        <div>
          <Button>
            <Link href={UNLOCK_LINKS.developers}>Visit our docs</Link>
          </Button>
        </div>
      </div>
      <div className="max-w-lg">
        <TabbedCodeBox blocks={CODE_BLOCKS} />
      </div>
    </section>
  )
}

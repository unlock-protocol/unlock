import { TabbedCodeBox, Button } from '@unlock-protocol/ui'

const CODE_BLOCKS: React.ComponentProps<typeof TabbedCodeBox>['blocks'] = [
  {
    code: `
<script>
  (function(d, s) {
    var js = d.createElement(s),
      sc = d.getElementsByTagName(s)[0];
      js.src="https://paywall.unlock-protocol.com/static/unlock.latest.min.js";
    sc.parentNode.insertBefore(js, sc); }(document, "script"));
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
    return {
      // ...paywall config
    }
  }
  async getUserEthereumAddress(req) {
    return req.cookies.userAddress
  },
  async updateUserEthereumAddress(req, res, address, signature, message) {
    res.cookie('userAddress', address)
  },
}
}, app)

// Members only page
app.get('/members', membersOnly(), (req, res) => {
  res.send('Secret stuff! <a href="/logout">logout</a>')
})
    `.trim(),
    lang: 'javascript',
    name: 'Backend',
  },
]

export function Developer() {
  return (
    <div className="grid items-center gap-8 sm:grid-flow-col">
      <div>
        <div className="grid gap-4 sm:gap-6 max-w-[350px]">
          <header>
            <h3 className="text-3xl font-bold sm:text-5xl max-w-[220px] sm:max-w-none">
              You&apos;re a dev? We got this.
            </h3>
          </header>
          <div>
            <p className="text-brand-gray">
              We&apos;re a protocol - not a platform. We&apos;re free,
              community-owned, and possess limitless opportunities for
              customization.
            </p>
          </div>
          <div>
            <Button> Check out docs </Button>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="min-w-[380px] max-w-[500px]">
          <TabbedCodeBox blocks={CODE_BLOCKS} />
        </div>
      </div>
    </div>
  )
}

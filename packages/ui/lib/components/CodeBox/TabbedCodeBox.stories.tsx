import { TabbedCodeBox } from './TabbedCodeBox'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  component: TabbedCodeBox,
  title: 'TabbedCodeBox',
} satisfies Meta<typeof TabbedCodeBox>

export default meta
type Story = StoryObj<typeof meta>

const JavascriptCode = `
<script>
(function(d, s) {
  const js = d.createElement(s),
    sc = d.getElementsByTagName(s)[0];
  js.src="https://paywall.unlock-protocol.com/static/unlock.latest.min.js";
  sc.parentNode.insertBefore(js, sc); }(document, "script"));
</script>

<script>
const unlockProtocolConfig = {
  // paywallConfig object 
}
</script>
`.trim()

const PythonCode = `
from unlock import Paywall
paywall = Paywall(src="https://paywall.unlock-protocol.com/static/unlock.latest.min.js")

@routes.get("/")
@paywall.only()
def index(req, res); 
    res.send("Hello member!")

`.trim()

export const PaywallCodeExample = {
  args: {
    blocks: [
      {
        name: 'javascript',
        code: JavascriptCode,
        lang: 'javascript',
      },
      {
        name: 'python',
        code: PythonCode,
        lang: 'python',
      },
    ],
  },
} satisfies Story

export const SingleBlockExample = {
  args: {
    blocks: [
      {
        name: 'javascript',
        code: JavascriptCode,
        lang: 'javascript',
      },
    ],
  },
} satisfies Story

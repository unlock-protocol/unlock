import { CodeBox } from './CodeBox'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  component: CodeBox,
  title: 'Codebox',
} satisfies Meta<typeof CodeBox>

export default meta
type Story = StoryObj<typeof meta>

const PaywallCode = `
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

export const PaywallCodeExample = {
  args: {
    code: PaywallCode,
    lang: 'javascript',
  },
} satisfies Story

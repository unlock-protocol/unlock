import { CodeBox } from './CodeBox'
import { ComponentMeta, ComponentStory } from '@storybook/react'

export default {
  component: CodeBox,
  title: 'Codebox',
} as ComponentMeta<typeof CodeBox>

const Template: ComponentStory<typeof CodeBox> = (args) => <CodeBox {...args} />

export const PaywallCodeExample = Template.bind({})

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

PaywallCodeExample.args = {
  code: PaywallCode,
  lang: 'javascript',
}

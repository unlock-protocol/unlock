import { TabbedCodeBox } from './TabbedCodeBox'
import { ComponentMeta, ComponentStory } from '@storybook/react'

export default {
  component: TabbedCodeBox,
  title: 'TabbedCodeBox',
} as ComponentMeta<typeof TabbedCodeBox>

const Template: ComponentStory<typeof TabbedCodeBox> = (args) => (
  <TabbedCodeBox {...args} />
)

export const PaywallCodeExample = Template.bind({})

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

PaywallCodeExample.args = {
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
}

export const SingleBlockExample = Template.bind({})

SingleBlockExample.args = {
  blocks: [
    {
      name: 'javascript',
      code: JavascriptCode,
      lang: 'javascript',
    },
  ],
}

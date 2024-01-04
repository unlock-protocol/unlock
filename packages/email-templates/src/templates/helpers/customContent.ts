import Handlebars from 'handlebars'

export const customContentStyle = `
  margin: 18px 0px; 
  padding: 18px 18px 10px 18px; 
  background: #F8FAFC; 
  font-family: monospace, sans-serif  !important;
`

export function formattedCustomContent(
  senderRole: string,
  customContent: string
) {
  if (customContent) {
    return new Handlebars.SafeString(`
      <p>Here is a message by the ${senderRole}:</p>
      <section style="${customContentStyle}">
        ${customContent}
      </section>
    `)
  }
  return ''
}

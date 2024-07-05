import Handlebars from 'handlebars'

export const verificationCodeStyle = `
  margin: 18px 0px; 
  padding: 18px 18px 10px 18px; 
  background: #F8FAFC; 
  text-align: center;
`

export function verificationCode(verificationCode: string) {
  let content = `
  <div style="${verificationCodeStyle}">
  	<h2>${verificationCode}</h2>
  </div>`

  return new Handlebars.SafeString(content)
}

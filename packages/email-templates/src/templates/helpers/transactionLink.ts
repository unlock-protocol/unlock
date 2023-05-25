import handlebars from 'handlebars'

export function transactionLink(url = '') {
  let linkText = ''

  if (url) {
    linkText = `<p>PS: you can view and print a <span><a href="${url}">transaction receipt</a> if needed.</span></p>`
  }

  return new handlebars.SafeString(linkText)
}

import handlebars from 'handlebars'

export function certificationLink(lockName: string, certificationUrl: string) {
  let linkText = ''

  if (lockName && certificationUrl) {
    linkText = `<p>Congratulations! You can view and share your certificate for <strong>${lockName}</strong> on LinkedIn <a href="${certificationUrl}">there</a>.</p>`
  }

  return new handlebars.SafeString(linkText)
}

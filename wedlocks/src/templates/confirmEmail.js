export default {
  subject: () => 'Please confirm your email address',
  text: params =>
    `Please confirm your email address by clicking on the following link ${
      params.confirmLink
    }.`
}

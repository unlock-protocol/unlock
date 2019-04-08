exports.decode = (data: string) => {
  const buff = Buffer.from(data, 'base64')
  return buff.toString('utf-8')
}

exports.encode = (data: string) => {
  const buff = Buffer.from(data, 'utf-8')
  return buff.toString('base64')
}

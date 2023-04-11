export const imageToBase64 = async (url: string) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'image/png',
    },
  })

  const contentType = response.headers.get('content-type')
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const imageURL = `data:${contentType};base64,${buffer.toString('base64')}`
  return imageURL
}

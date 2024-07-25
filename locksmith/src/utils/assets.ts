import Forage from './forage'

interface tokenCentricData {
  base: string
  address: string
  tokenId: string
}

interface ticketsBannerData {
  base: string
  address: string
}

interface tokenMetadataDefaultData {
  base: string
  address: string
}

export const exists = async (image: string) => {
  try {
    const response = await fetch(image, { method: 'HEAD' })
    return response.ok
  } catch (e) {
    return false
  }
}

export const tokenMetadataDefaultImage = (data: tokenMetadataDefaultData) => {
  const fg = new Forage()
  return `${data.base}/${fg.tokenMetadataDefaultImage(data)}`
}

export const tokenCentricImage = (data: tokenCentricData) => {
  const fg = new Forage()
  return `${data.base}/${fg.tokenCentricImage(data)}`
}

export const ticketsBannerImage = (data: ticketsBannerData) => {
  const fg = new Forage()
  return `${data.base}/${fg.ticketsBannerImage(data)}`
}

const Assets = {
  ticketsBannerImage,
  tokenCentricImage,
  tokenMetadataDefaultImage,
  exists,
}

export default Assets

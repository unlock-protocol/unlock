import Forage from './forage'

const request = require('request-promise-native')

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
    const lookup = await request(image, { resolveWithFullResponse: true })
    return lookup.statusCode == 200
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

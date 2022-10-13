export default class Forage {
  private normalizedAddress(address: string) {
    return address.toLowerCase()
  }

  tokenMetadataDefaultImage(data: any) {
    return `${this.normalizedAddress(data.address)}/metadata/default_image`
  }

  tokenCentricImage(data: any) {
    return `${this.normalizedAddress(data.address)}/metadata/${data.tokenId}`
  }

  ticketsBannerImage(data: any) {
    return `${this.normalizedAddress(data.address)}/tickets/banner`
  }
}

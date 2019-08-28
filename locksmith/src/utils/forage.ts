/* eslint-disable no-unused-vars */
export enum Usage {
  TicketBanner = 'banner',
  TokenDefaultImage = 'default-image',
  TokenSpecificImage = 'token-image',
}
/* eslint-enable no-unused-vars */

export class Forage {
  locate(usage: Usage, data: any): string {
    switch (usage) {
      case Usage.TicketBanner:
        return this.ticketsBannerImage(data)
      case Usage.TokenDefaultImage:
        return this.tokenMetadataDefaultImage(data)
      case Usage.TokenSpecificImage:
        return this.tokenCentricImage(data)
    }
  }

  private normalizedAddress(address: string) {
    return address.toLowerCase()
  }

  private tokenMetadataDefaultImage(data: any) {
    return `${this.normalizedAddress(data.address)}/metadata/default_image`
  }

  private tokenCentricImage(data: any) {
    return `${this.normalizedAddress(data.address)}/metadata/${data.tokenId}`
  }

  private ticketsBannerImage(data: any) {
    return `${this.normalizedAddress(data.address)}/tickets/banner`
  }
}

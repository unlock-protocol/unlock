export enum Usage {
  TicketBanner = 'banner',
  TokenDefaultImage = 'default-image',
  TokenSpecificImage = 'token-image',
}

export class Forage {
  locate(usage: Usage, data: any): string {
    switch (usage) {
      case Usage.TicketBanner:
        return this.tickets_banner_image(data)
      case Usage.TokenDefaultImage:
        return this.token_metadata_default_image(data)
      case Usage.TokenSpecificImage:
        return this.token_centric_image(data)
    }
  }

  normalizedAddress(address: string) {
    return address.toLowerCase()
  }

  token_metadata_default_image(data: any) {
    return `${this.normalizedAddress(data.address)}/metadata/default_image`
  }

  token_centric_image(data: any) {
    return `${this.normalizedAddress(data.address)}/metadata/${data.tokenId}`
  }

  tickets_banner_image(data: any) {
    return `${this.normalizedAddress(data.address)}/tickets/banner`
  }
}

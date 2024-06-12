import jwt from 'jsonwebtoken'

export async function createWalletPassObject(
  classId: string,
  lockName: string,
  networkName: string,
  lockAddress: string,
  keyId: string,
  qrCodeUrl: string,
  client_email: string,
  private_key: string
) {
  //   create a new wallet pass for the user
  const objectId = `${classId}.${keyId}`

  const userWalletPassObject = {
    id: `${objectId}`,
    classId: classId,
    hexBackgroundColor: '#fffcf6',
    logo: {
      sourceUri: {
        // unlock protocol's logo
        uri: 'https://raw.githubusercontent.com/unlock-protocol/unlock/master/design/logo/%C9%84nlock-Logo-monogram-black.png',
      },
      contentDescription: {
        defaultValue: {
          language: 'en-US',
          value: 'LOGO_IMAGE_DESCRIPTION',
        },
      },
    },
    cardTitle: {
      defaultValue: {
        language: 'en-US',
        value: lockName,
      },
    },
    subheader: {
      defaultValue: {
        language: 'en-US',
        value: 'Event',
      },
    },
    header: {
      defaultValue: {
        language: 'en-US',
        value: lockName,
      },
    },
    textModulesData: [
      {
        id: 'id',
        header: 'ID',
        body: keyId,
      },
      {
        id: 'network',
        header: 'Network',
        body: networkName,
      },
      {
        id: 'lock_address',
        header: 'Lock Address',
        body: lockAddress,
      },
    ],
    barcode: {
      type: 'QR_CODE',
      value: qrCodeUrl,
      alternateText: '',
    },
  }

  const claims = {
    iss: client_email,
    aud: 'google',
    origins: [],
    typ: 'savetowallet',
    payload: {
      genericObjects: [userWalletPassObject],
    },
  }

  const token = jwt.sign(claims, private_key, {
    algorithm: 'RS256',
  })

  const saveUrl = `https://pay.google.com/gp/v/save/${token}`
  return saveUrl
}

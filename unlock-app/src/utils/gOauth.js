/* eslint-disable no-undef */
import { ethers } from 'ethers'
import GoogleDrive from './googleDrive'

const SCOPES =
  'profile email https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.metadata.readonly'

/* Currently the assumption is that ethers is in scope */
export function generateWallet() {
  return ethers.Wallet.createRandom()
}

export async function signedInHandler(fileName) {
  const gd = new GoogleDrive()
  const filePresent = await gd.filePresent(fileName)

  if (!filePresent) {
    const data = generateWallet().signingKey
    gd.createFile(fileName, data)
  }
}

export function onSuccess() {
  signedInHandler('wallet.json')
}

export function getGapi(config) {
  gapi.load('client:auth2', async () => {
    await gapi.client.init(config)
    this.renderGoogleAuthenticationButton()
  })
}

export function renderGoogleAuthenticationButton() {
  gapi.signin2.render('signin', {
    scope: SCOPES,
    width: 240,
    height: 50,
    longtitle: true,
    theme: 'dark',
    onsuccess: this.onSuccess,
  })
}

export async function signOut() {
  const auth2 = window.gapi.auth2.getAuthInstance()
  await auth2.signOut()
}

export interface UserCreationInput {
  emailAddress: String
  publicKey: String
  passwordEncryptedPrivateKey: String
  recoveryPhrase: String
}

// eslint chokes on this file when there is only one thing exported, because it
// thinks default exports are necessary for files that only export one
// thing. You can't do a default export of an interface, so here we are.
export interface Dummy {
  name: string
}

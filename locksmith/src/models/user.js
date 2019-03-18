'use strict'
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      publicKey: DataTypes.STRING,
      recoveryPhrase: DataTypes.STRING,
      passwordEncryptedPrivateKey: DataTypes.JSON,
    },
    {}
  )

  User.removeAttribute('id')
  return User
}

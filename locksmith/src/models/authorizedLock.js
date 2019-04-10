'use strict'
module.exports = (sequelize, DataTypes) => {
  const AuthorizedLock = sequelize.define(
    'AuthorizedLock',
    {
      address: DataTypes.STRING,
      authorizedAt: DataTypes.DATE,
    },
    {}
  )
  // AuthorizedLock.associate= function(models) {
  AuthorizedLock.associate = function() {
    // associations can be defined here
  }
  return AuthorizedLock
}

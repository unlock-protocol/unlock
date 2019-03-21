module.exports = (sequelize, DataTypes) => {
  const UserReference = sequelize.define(
    'UserReference',
    {
      emailAddress: DataTypes.STRING,
    },
    {}
  )
  UserReference.associate = function(models) {
    UserReference.belongsTo(models.User, {
      foreignKey: 'publicKey',
      targetKey: 'publicKey',
    })
  }
  sequelize.sync()
  return UserReference
}

'use strict'
module.exports = (sequelize, DataTypes) => {
  const Block = sequelize.define(
    'Block',
    {
      timestamp: DataTypes.INTEGER,
      hash: DataTypes.STRING,
      number: DataTypes.BIGINT,
      chain: DataTypes.INTEGER,
    },
    {}
  )
  Block.associate = function() {
    // associations can be defined here
  }

  Block.removeAttribute('id')
  return Block
}

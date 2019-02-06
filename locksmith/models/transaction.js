'use strict'
module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    transactionHash: DataTypes.STRING,
    sender: DataTypes.STRING,
    recipient: DataTypes.STRING, 
  }, {})
  Transaction.associate = function(models) {
    // associations can be defined here
  }
  return Transaction
}

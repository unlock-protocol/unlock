'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('PaymentIntents', 'recipients', {
      type: Sequelize.JSON,
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('PaymentIntents', 'recipients')
  },
}

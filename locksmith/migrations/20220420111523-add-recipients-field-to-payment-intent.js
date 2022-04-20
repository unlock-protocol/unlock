'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('PaymentIntents', 'recipients', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('PaymentIntents', 'recipients')
  },
}

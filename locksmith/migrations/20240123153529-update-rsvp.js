'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      'Rsvps',
      'rsvps_lock_address_network_approval'
    )
    await queryInterface.addIndex('Rsvps', {
      unique: true,
      fields: ['lockAddress', 'userAddress', 'network', 'approval'],
    })
  },
  async down(queryInterface, Sequelize) {},
}

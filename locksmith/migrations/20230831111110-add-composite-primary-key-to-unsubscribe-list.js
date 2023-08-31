'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('UnsubscribeList', 'lockAddress', {
      allowNull: false,
      type: Sequelize.STRING,
      primaryKey: true,
    })
    await queryInterface.changeColumn('UnsubscribeList', 'userAddress', {
      allowNull: false,
      type: Sequelize.STRING,
      primaryKey: true,
    })
    await queryInterface.changeColumn('UnsubscribeList', 'network', {
      allowNull: false,
      type: 'pg_chain_id',
      primaryKey: true,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('UnsubscribeList', 'lockAddress', {
      allowNull: false,
      type: Sequelize.STRING,
    })
    await queryInterface.changeColumn('UnsubscribeList', 'userAddress', {
      allowNull: false,
      type: Sequelize.STRING,
    })
    await queryInterface.changeColumn('UnsubscribeList', 'network', {
      allowNull: false,
      type: 'pg_chain_id',
    })
  },
}

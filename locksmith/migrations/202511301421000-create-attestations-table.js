'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Attestations', {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4,
        primaryKey: true,
      },
      lockAddress: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      network: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
      },
      tokenId: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      schemaId: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      attestationId: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      txHash: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      data: {
        type: Sequelize.DataTypes.JSON,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
    })

    // Indexes
    await queryInterface.addIndex('Attestations', ['lockAddress', 'network'])
    await queryInterface.addIndex('Attestations', [
      'tokenId',
      'lockAddress',
      'network',
    ])
    await queryInterface.addIndex('Attestations', ['attestationId'], {
      unique: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Attestations')
  },
}

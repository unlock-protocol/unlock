module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('LockMigrations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      lockAddress: {
        type: Sequelize.STRING,
      },
      newLockAddress: {
        type: Sequelize.STRING,
      },
      chain: {
        type: Sequelize.INTEGER,
      },
      newChain: {
        type: Sequelize.INTEGER,
      },
      initiatedBy: {
        type: Sequelize.STRING,
      },
      logs: {
        type: Sequelize.TEXT,
      },
      migrated: {
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })

    await queryInterface.addIndex('LockMigrations', { fields: ['chain'] })
    await queryInterface.addIndex('LockMigrations', { fields: ['lockAddress'] })
    await queryInterface.addIndex('LockMigrations', {
      fields: ['newLockAddress'],
    })
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('LockMigrations')
  },
}

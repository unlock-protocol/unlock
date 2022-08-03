'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.changeColumn(
        'UserTokenMetadata',
        'data',
        {
          type: Sequelize.DataTypes.JSONB,
          defaultValue: {},
          allowNull: false,
        },
        {
          transaction,
        }
      )

      await queryInterface.changeColumn(
        'KeyMetadata',
        'data',
        {
          type: Sequelize.DataTypes.JSONB,
          defaultValue: {},
          allowNull: true,
        },
        {
          transaction,
        }
      )

      await queryInterface.changeColumn(
        'LockMetadata',
        'data',
        {
          type: Sequelize.DataTypes.JSONB,
          defaultValue: {},
          allowNull: false,
        },
        {
          transaction,
        }
      )

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.changeColumn(
        'UserTokenMetadata',
        'data',
        {
          type: Sequelize.DataTypes.JSON,
          defaultValue: {},
          allowNull: false,
        },
        {
          transaction,
        }
      )

      await queryInterface.changeColumn(
        'KeyMetadata',
        'data',
        {
          type: Sequelize.DataTypes.JSON,
          defaultValue: {},
          allowNull: true,
        },
        {
          transaction,
        }
      )

      await queryInterface.changeColumn(
        'LockMetadata',
        'data',
        {
          type: Sequelize.DataTypes.JSON,
          defaultValue: {},
          allowNull: false,
        },
        {
          transaction,
        }
      )

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  },
}

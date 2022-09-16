module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.addColumn(
        'Charges',
        'recurring',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        {
          transaction,
        }
      )

      await queryInterface.changeColumn(
        'Charges',
        'recipients',
        {
          type: Sequelize.DataTypes.JSONB,
          defaultValue: [],
          allowNull: true,
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

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.removeColumn('Charges', 'recurring', {
        transaction,
      })

      await queryInterface.changeColumn(
        'Charges',
        'recipients',
        {
          type: Sequelize.DataTypes.JSON,
          defaultValue: [],
          allowNull: true,
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

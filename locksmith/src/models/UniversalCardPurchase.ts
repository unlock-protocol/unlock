import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import { Model, DataTypes, CreationOptional } from 'sequelize'
import { LocksmithDataTypes, sequelize } from './sequelize'

export class UniversalCardPurchase extends Model<
  InferAttributes<UniversalCardPurchase>,
  InferCreationAttributes<UniversalCardPurchase>
> {
  declare id: CreationOptional<string>
  declare lockAddress: string
  declare network: number
  declare userAddress: string
  declare stripeSession: string
  declare body: any
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

UniversalCardPurchase.init(
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
    },
    lockAddress: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    network: {
      allowNull: false,
      type: LocksmithDataTypes.NETWORK_ID,
    },
    userAddress: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    stripeSession: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    body: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'UniversalCardPurchases',
  }
)

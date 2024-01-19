import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { sequelize } from './index'

export class Rsvp extends Model<
  InferAttributes<Rsvp>,
  InferCreationAttributes<Rsvp>
> {
  declare lockAddress: string
  declare userAddress: string
  declare network: number
  declare approval: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

Rsvp.init(
  {
    lockAddress: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    userAddress: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    network: {
      allowNull: false,
      type: 'pg_chain_id',
    },
    approval: {
      type: DataTypes.STRING,
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
    indexes: [
      {
        name: 'lock_user_network',
        fields: ['lockAddress', 'userAddress', 'network'],
        unique: true,
      },
      {
        name: 'approval_lock_network',
        fields: ['lockAddress', 'network', 'approval'],
      },
    ],
    modelName: 'Rsvp',
    tableName: 'Rsvps',
  }
)

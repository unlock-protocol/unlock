import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { LocksmithDataTypes, sequelize } from './sequelize'

export class KeyExpirationReminder extends Model<
  InferAttributes<KeyExpirationReminder>,
  InferCreationAttributes<KeyExpirationReminder>
> {
  declare id: CreationOptional<number>

  declare network: number
  declare lockAddress: string
  declare tokenId: number
  declare type: string
  declare expiration: string

  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

KeyExpirationReminder.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    lockAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    network: {
      type: LocksmithDataTypes.NETWORK_ID,
      allowNull: false,
    },
    tokenId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiration: {
      type: DataTypes.STRING,
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
    modelName: 'KeyExpirationReminders',
    freezeTableName: true,
  }
)

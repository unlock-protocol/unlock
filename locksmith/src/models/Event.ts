import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize'
import { CheckoutConfig } from './checkoutConfig'
import config from '../config/config'

export class EventData extends Model<
  InferAttributes<EventData>,
  InferCreationAttributes<EventData>
> {
  declare id: CreationOptional<number>
  declare name: string
  declare data: any // TODO: TYPE maybe change to json as well?
  declare createdBy: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare slug: string
  declare checkoutConfigId: string | null
  declare eventUrl: string | null
}

EventData.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    createdBy: {
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
    slug: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    checkoutConfigId: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    eventUrl: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${config.unlockApp}/event/${this.getDataValue('slug')}`
      },
    },
  },
  {
    defaultScope: {},
    scopes: {
      withoutId: {
        attributes: { exclude: ['id'] },
      },
    },
    sequelize,
    modelName: 'EventData',
    tableName: 'EventData',
  }
)

EventData.belongsTo(CheckoutConfig, {
  foreignKey: 'checkoutConfigId',
  as: 'checkoutConfig',
})

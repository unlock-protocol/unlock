import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize'
import { CheckoutConfig } from './checkoutConfig'
import config from '../config/config'

export interface PendingLockDeployment {
  transaction: string
  network: number
  name: string
}

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
  declare pendingTransactionHash: string | null
  declare network: number | null
  declare isPending: boolean
  declare lockAddress: string | null

  /**
   * Updates the event with pending lock deployment information
   */
  async setPendingLock(pendingLock: PendingLockDeployment) {
    this.pendingTransactionHash = pendingLock.transaction
    this.network = pendingLock.network
    await this.save()
  }

  /**
   * Clears pending lock information and sets the deployed lock details
   */
  async setDeployedLock(
    lockAddress: string,
    network: number,
    checkoutConfig: any
  ) {
    this.pendingTransactionHash = null
    this.network = null
    this.checkoutConfigId = checkoutConfig.id

    // Update the data field to include the deployed lock address
    this.data = {
      ...this.data,
      lockAddress,
      network,
    }

    await this.save()
  }

  /**
   * Returns whether this event has a pending lock deployment
   */
  hasPendingLock(): boolean {
    return !!this.pendingTransactionHash
  }

  /**
   * Returns whether this event has a deployed lock
   */
  hasDeployedLock(): boolean {
    return !!this.checkoutConfigId
  }
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
    pendingTransactionHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    network: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isPending: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    lockAddress: {
      type: DataTypes.STRING,
      allowNull: true,
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

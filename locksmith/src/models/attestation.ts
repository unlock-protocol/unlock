import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize'

export class Attestation extends Model<
  InferAttributes<Attestation>,
  InferCreationAttributes<Attestation>
> {
  declare id: CreationOptional<string>
  declare lockAddress: string
  declare network: number
  declare tokenId: string
  declare schemaId: string
  declare attestationId: string
  declare txHash: CreationOptional<string | null>
  declare data: object
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

Attestation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    lockAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    network: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tokenId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    schemaId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    attestationId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    txHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'Attestations',
    timestamps: true,
    indexes: [
      {
        fields: ['lockAddress', 'network'],
      },
      {
        fields: ['tokenId', 'lockAddress', 'network'],
      },
      {
        fields: ['attestationId'],
        unique: true,
      },
    ],
  }
)

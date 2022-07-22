import { Optional } from 'sequelize'
import { Table, Model, Column } from 'sequelize-typescript'

interface KeyRenewalAttributes {
  id: number
  lockAddress: string
  keyId: number
  initiatedBy?: string
  tx: string
  network: number
}

type KeyRenewalCreationAttributes = Optional<KeyRenewalAttributes, 'id'>

@Table({ tableName: 'KeyRenewals', timestamps: true })
export class KeyRenewal extends Model<
  KeyRenewalAttributes,
  KeyRenewalCreationAttributes
> {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number

  @Column
  lockAddress!: string

  @Column
  keyId!: string

  @Column
  initiatedBy!: string

  @Column
  tx!: string

  @Column
  network!: number
}

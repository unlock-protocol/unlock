import { Optional } from 'sequelize'
import { Table, Model, Column, DataType } from 'sequelize-typescript'

interface KeyMetadataAttributes {
  id: string
  data: any
  address: string
  chain: number
}

type KeyMetadataCreationAttributes = Optional<KeyMetadataAttributes, 'id'>

@Table({ tableName: 'KeyMetadata', timestamps: true })
export class KeyMetadata extends Model<
  KeyMetadataAttributes,
  KeyMetadataCreationAttributes
> {
  @Column(DataType.JSONB)
  data!: JSON

  @Column({ primaryKey: true, unique: 'id_unique' })
  id!: string

  @Column({
    unique: 'id_unique',
  })
  address!: string

  @Column
  chain!: number
}

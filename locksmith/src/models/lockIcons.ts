import { Table, Column, Model } from 'sequelize-typescript'

interface LockIconsAttributes {
  lock: string
  chain: string
  icon: string
}

@Table({ tableName: 'LockIcons', timestamps: true })
export class LockIcons extends Model<LockIconsAttributes> {
  @Column({ unique: 'lock_chain_index' })
  lock!: string

  @Column({ unique: 'lock_chain_index' })
  chain!: number

  @Column
  icon!: string
}

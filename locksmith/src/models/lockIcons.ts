import { Table, Column, Model } from 'sequelize-typescript'

@Table({ tableName: 'LockIcons', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class LockIcons extends Model<LockIcons> {
  @Column({ unique: 'lock_chain_index' })
  lock!: string

  @Column({ unique: 'lock_chain_index' })
  chain!: number

  @Column
  icon!: string
}

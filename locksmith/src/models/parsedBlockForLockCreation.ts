import { Model, Table, Column } from 'sequelize-typescript'

@Table({ tableName: 'ParsedBlockForLockCreations', timestamps: true })
export class ParsedBlockForLockCreation extends Model<ParsedBlockForLockCreation> {
  @Column
  blockNumber!: number
}

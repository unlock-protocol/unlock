import Model, { Table, Column } from './sequelize'

@Table({ tableName: 'ParsedBlockForLockCreations', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class ParsedBlockForLockCreation extends Model<ParsedBlockForLockCreation> {
  @Column
  blockNumber!: number
}

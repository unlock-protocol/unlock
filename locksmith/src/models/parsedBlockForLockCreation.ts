import { Model, Table, Column } from 'sequelize-typescript'

interface ParsedBlockForLockCreationAttributes {
  blockNumber: number
}

@Table({ tableName: 'ParsedBlockForLockCreations', timestamps: true })
export class ParsedBlockForLockCreation extends Model<ParsedBlockForLockCreationAttributes> {
  @Column
  blockNumber!: number
}

import { Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class RegistryKey {
  @PrimaryColumn()
  address: string
}

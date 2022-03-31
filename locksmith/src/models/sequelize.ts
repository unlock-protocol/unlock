/* eslint-disable no-redeclare */

import {
  ModelAttributeColumnOptions,
  DataType as SequelizeDataType,
  ModelOptions,
  ModelValidateOptions,
  Model,
  DataTypes,
  BelongsToOptions,
} from 'sequelize/types'

interface TableOptions extends ModelOptions {
  modelName?: string
  /**
   * Enable optimistic locking.  When enabled, sequelize will add a version count attribute
   * to the model and throw an OptimisticLockingError error when stale instances are saved.
   * Set to true or a string with the attribute name you want to use to enable.
   */
  version?: boolean | string
}

export declare function Table(options: TableOptions): Function
export declare function Table(target: Function): void

export declare function Column(dataType: SequelizeDataType): Function
export declare function Column(
  options: Partial<ModelAttributeColumnOptions>
): Function
export declare function Column(
  target: any,
  propertyName: string,
  propertyDescriptor?: PropertyDescriptor
): void

export declare function Validate(options: ModelValidateOptions): Function

export declare function AllowNull(target: any, propertyName: string): void
export declare function AllowNull(allowNull: boolean): Function

type ModelClassGetter = (returns?: void) => typeof Model
export declare function BelongsTo(
  associatedClassGetter: ModelClassGetter,
  foreignKey?: string
): Function
export declare function BelongsTo(
  associatedClassGetter: ModelClassGetter,
  options?: BelongsToOptions
): Function

export declare const DataType: typeof DataTypes

export default Model

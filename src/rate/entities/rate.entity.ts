import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
} from 'sequelize-typescript';

@Table({
  tableName: 'rates',
  indexes: [
    {
      unique: true,
      fields: ['_id'],
    },
  ],
})
export class Rate extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  _id: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  rate: number;
  // #############################
}

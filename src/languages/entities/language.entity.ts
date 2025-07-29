import {
  Table,
  Column,
  DataType,
  HasMany,
  Model,
  HasOne,
} from 'sequelize-typescript';

import { User } from 'src/user/entities/user.entity';
@Table({
  tableName: 'languages',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['_id'],
    },
  ],
})
export class Language extends Model {
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
    type: DataType.STRING,
    unique: 'lang_name',
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lang_code: string;

  // ################################
  @HasOne(() => User, {
    constraints: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    hooks: true,
    foreignKey: 'language_id',
  })
  users: User[];

  // #############################
}

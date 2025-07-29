import {
  Table,
  Column,
  DataType,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.entity';

@Table({
  tableName: 'user_searches',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ['_id'],
    },
  ],
})
export class UserSearch extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  _id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  search: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  result_count: number;

  // #######################################
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id: number;
  @BelongsTo(() => User, { foreignKey: 'user_id' })
  user: User;
  // #######################################
}

import {
  Table,
  Column,
  DataType,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.entity';
import { enumTypeOfMaliciousProcedure } from 'src/common/enums/enums';

@Table({
  tableName: 'malicious_requests',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['_id'],
    },
  ],
})
export class MaliciousRequest extends Model {
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
    allowNull: false,
  })
  ip: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  api_path: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  message: string;

  @Column({
    type: DataType.ENUM(...Object.values(enumTypeOfMaliciousProcedure)),
    allowNull: false,
  })
  procedure: enumTypeOfMaliciousProcedure;
  // #######################################
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  user_id: number;
  @BelongsTo(() => User, { foreignKey: 'user_id' })
  user: User;
}

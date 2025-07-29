import {
  Table,
  Column,
  DataType,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.entity';
import { enumTypeOfLogs } from 'src/common/enums/enums';
import { UserDevice } from './user_device.entity';

@Table({
  tableName: 'user_logs',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['_id'],
    },
  ],
})
export class UserLog extends Model {
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
    type: DataType.ENUM(...Object.values(enumTypeOfLogs)),
    allowNull: false,
  })
  type: enumTypeOfLogs;

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
  @ForeignKey(() => UserDevice)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  device_id: number;
  @BelongsTo(() => UserDevice, { foreignKey: 'device_id' })
  device: UserDevice;
}

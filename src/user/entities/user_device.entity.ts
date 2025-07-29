import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
  HasMany,
} from 'sequelize-typescript';
import { User } from './user.entity';
import { enumOsType } from 'src/common/enums/enums';
import { UserRefreshToken } from './user_refresh_token.entity';
import { UserLog } from './user_log.entity';

@Table({
  tableName: 'user_devices',
  indexes: [
    {
      unique: true,
      fields: ['_id'],
    },
  ],
})
export class UserDevice extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  _id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: 'device_serial',
  })
  serial: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.ENUM(...Object.values(enumOsType)),
    allowNull: false,
  })
  os_type: enumOsType;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  is_block: boolean;

  // #############################
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: 'device_serial',
  })
  user_id: number;
  @BelongsTo(() => User, { foreignKey: 'user_id' })
  user: User;

  // #############################
  @HasMany(() => UserRefreshToken, {
    constraints: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true,
    foreignKey: 'device_id',
  })
  refreshToken: UserRefreshToken;

  // #############################
  @HasMany(() => UserLog, {
    constraints: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true,
    foreignKey: 'device_id',
  })
  logs: UserLog;
}

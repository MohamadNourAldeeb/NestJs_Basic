import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  BeforeCreate,
  Model,
} from 'sequelize-typescript';
import { User } from './user.entity';
import { EncryptionService } from 'src/common/services/encrypt.service';
import { UserDevice } from './user_device.entity';
import { Version } from 'src/versions/entities/version.entity';

@Table({
  tableName: 'user_refresh_tokens',
  indexes: [
    {
      unique: true,
      fields: ['_id'],
    },
  ],
})
export class UserRefreshToken extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  _id: string;

  @Column({
    type: DataType.STRING(800),
    allowNull: false,
  })
  token: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  fcm_token: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiry: Date;

  // #############################
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: 'unique_token',
  })
  user_id: number;
  @BelongsTo(() => User, { foreignKey: 'user_id' })
  user: User;

  // #############################
  @ForeignKey(() => UserDevice)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: 'unique_token',
  })
  device_id: number;
  @BelongsTo(() => UserDevice, {
    foreignKey: 'device_id',
    onDelete: 'CASCADE',
    hooks: true,
  })
  device: UserDevice;

  // #############################
  @ForeignKey(() => Version)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  version_id: number;
  @BelongsTo(() => Version, {
    foreignKey: 'version_id',
    onDelete: 'CASCADE',
    hooks: true,
  })
  appVersion: Version;
  // #############################

  @BeforeCreate
  static async hashToken(refreshToken: UserRefreshToken): Promise<void> {
    refreshToken.token = EncryptionService.encryptToken(refreshToken.token);
  }
}

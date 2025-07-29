import {
  Table,
  Column,
  DataType,
  HasMany,
  BeforeCreate,
  Model,
  ForeignKey,
  BelongsTo,
  BeforeUpdate,
} from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';
import { Role } from '../../role/entities/role.entity';

import { UserPermission } from './user_permission.entity';
import { Language } from 'src/languages/entities/language.entity';
import { ActivityLog } from './activity_log.entity';
import { UserRefreshToken } from './user_refresh_token.entity';
import { enumStateOfEmail } from 'src/common/enums/enums';
import { BlockList } from 'src/block/entities/block.entity';
import { UserLog } from './user_log.entity';
import { UserDevice } from './user_device.entity';
import { UserSearch } from './user_searches.entity';
import { ProfileViewer } from 'src/profile/entities/profile.entity';

@Table({
  tableName: 'users',
  timestamps: true,
  // paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ['_id'],
    },
  ],
})
export class User extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  _id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: 'unique_user_name',
  })
  user_name: string;

  @Column({
    type: DataType.STRING,
    unique: 'unique_email',
    allowNull: true,
  })
  email: string;

  @Column({
    type: DataType.ENUM(...Object.values(enumStateOfEmail)),
    allowNull: false,
    defaultValue: enumStateOfEmail.UNVERIFIED,
  })
  email_state: enumStateOfEmail;

  @Column({
    type: DataType.STRING,
    unique: 'unique_phone',
    allowNull: true,
  })
  phone_number: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  password: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  first_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  last_name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  google_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  picture: string;

  // ###################################
  @ForeignKey(() => Role)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  role_id: number;
  @BelongsTo(() => Role, {
    foreignKey: 'role_id',
    onDelete: 'CASCADE',
    hooks: true,
  })
  role!: Role;
  // ###################################
  @ForeignKey(() => Language)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  language_id: number;
  @BelongsTo(() => Language, {
    foreignKey: 'language_id',
    onDelete: 'CASCADE',
    hooks: true,
  })
  Language: Language;
  // ###################################

  @HasMany(() => ActivityLog, {
    constraints: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true,
    foreignKey: 'user_id',
  })
  activityLogs: ActivityLog[];

  // #########################################33
  // @HasMany(() => Gallery, {
  //   constraints: true,
  //   onDelete: 'CASCADE',
  //   onUpdate: 'CASCADE',
  //   hooks: true,
  // })
  // createdBy: Gallery[];

  // ###################################
  @HasMany(() => UserPermission, {
    constraints: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true,
    foreignKey: 'user_id',
  })
  userPermission: UserPermission[];
  // ###################################
  @HasMany(() => UserDevice, {
    constraints: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true,
    foreignKey: 'user_id',
  })
  UserDevices: UserDevice[];
  // ###################################

  @HasMany(() => UserRefreshToken, {
    constraints: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true,
    foreignKey: 'user_id',
  })
  refreshTokens: UserRefreshToken[];
  // ###################################

  @HasMany(() => BlockList, {
    constraints: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true,
    as: 'block_data',
    foreignKey: 'blocker_id',
  })
  blockers: BlockList[];
  // ###################################
  @HasMany(() => BlockList, {
    constraints: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true,
    as: 'block_user_data',
    foreignKey: 'user_id',
  })
  usersBlock: BlockList[];
  // ###################################
  @HasMany(() => UserLog, {
    constraints: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true,
    foreignKey: 'user_id',
  })
  userLogs: UserLog[];

  // ###################################
  @HasMany(() => UserSearch, {
    constraints: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true,
    foreignKey: 'user_id',
  })
  UserSearchs: UserSearch[];

  // ###################################
  @HasMany(() => ProfileViewer, {
    constraints: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true,
    foreignKey: 'user_id',
  })
  UserView: ProfileViewer[];

  // ###################################
  @HasMany(() => ProfileViewer, {
    constraints: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true,
    foreignKey: 'viewer_id',
  })
  Viewer: ProfileViewer[];

  // ###################################
  @BeforeCreate
  static async hashPassword(user: User): Promise<void> {
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  }
  @BeforeUpdate
  static async hashPasswordUpdate(user: User, options: any): Promise<void> {
    if (options.fields && options.fields.includes('password')) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  }
}

// src/user/user.model.ts

import {
  Table,
  Column,
  DataType,
  HasMany,
  BeforeCreate,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../user/entities/user.entity';
import { RolePermission } from './roles_permissions.entity';

@Table({
  tableName: 'roles',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['_id'],
    },
  ],
})
export class Role extends Model {
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
    unique: true,
    allowNull: false,
  })
  name: string;

  @HasMany(() => User, {
    constraints: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true,
    foreignKey: 'role_id',
  })
  users: User[];

  @HasMany(() => RolePermission, {
    constraints: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true,
    foreignKey: 'role_id',
  })
  role_permissions: RolePermission[];
}

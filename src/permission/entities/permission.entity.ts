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
import { RolePermission } from '../../role/entities/roles_permissions.entity';

@Table({ tableName: 'permissions', timestamps: true })
export class Permission extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  mode: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description: string;

  @HasMany(() => RolePermission, {
    constraints: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true,
    foreignKey: 'permission_id',
  })
  role_permission: RolePermission[];
}

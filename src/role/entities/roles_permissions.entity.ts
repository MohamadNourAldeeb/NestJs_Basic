import {
  Table,
  Column,
  DataType,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Role } from './role.entity';
import { Permission } from '../../permission/entities/permission.entity';
@Table({ tableName: 'role_permissions', timestamps: true })
export class RolePermission extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  role_id: number;
  @BelongsTo(() => Role)
  role!: Role;

  @ForeignKey(() => Permission)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  permission_id: number;
  @BelongsTo(() => Permission, { foreignKey: 'permission_id' })
  permission!: Permission;
}

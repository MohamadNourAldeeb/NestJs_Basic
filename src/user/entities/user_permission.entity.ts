import {
  Table,
  Column,
  DataType,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.entity';
import { Permission } from '../../permission/entities/permission.entity';
import { enumUserPermissionsType } from 'src/common/enums/enums';

@Table({ tableName: 'user_permissions', timestamps: true })
export class UserPermission extends Model {
  @Column({
    type: DataType.ENUM(...Object.values(enumUserPermissionsType)),
    allowNull: false,
  })
  status: enumUserPermissionsType;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id: number;
  @BelongsTo(() => User, { foreignKey: 'user_id' })
  user: User;
  // #############################
  @ForeignKey(() => Permission)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  permission_id: number;
  @BelongsTo(() => Permission, { foreignKey: 'permission_id' })
  permission!: Permission;
}

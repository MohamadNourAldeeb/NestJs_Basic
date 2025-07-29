import { Table, Column, DataType, Model, HasOne } from 'sequelize-typescript';
import { enumVersionPriority, enumOsType } from 'src/common/enums/enums';
import { UserRefreshToken } from 'src/user/entities/user_refresh_token.entity';

@Table({
  tableName: 'versions',
  indexes: [
    {
      unique: true,
      fields: ['_id'],
    },
  ],
})
export class Version extends Model {
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
  app_version: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  app_name: string;

  @Column({
    type: DataType.ENUM(...Object.values(enumOsType)),
    allowNull: false,
  })
  app_type: enumOsType;

  @Column({
    type: DataType.ENUM(...Object.values(enumVersionPriority)),
    allowNull: false,
  })
  priority: enumVersionPriority;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expiredAt: Date;

  // #############################
  @HasOne(() => UserRefreshToken, {
    constraints: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true,
    foreignKey: 'version_id',
  })
  refreshToken: UserRefreshToken;
}

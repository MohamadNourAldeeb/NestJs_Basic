import {
  Table,
  Column,
  DataType,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { enumTypeOfBlock } from 'src/common/enums/enums';
import { User } from 'src/user/entities/user.entity';

@Table({
  tableName: 'block_list',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['_id'],
    },
  ],
})
export class BlockList extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  _id: string;

  @Column({
    type: DataType.ENUM(...Object.values(enumTypeOfBlock)),
    allowNull: false,
  })
  type: enumTypeOfBlock;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  reason: string;
  // #######################################
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  blocker_id: number;
  @BelongsTo(() => User, { foreignKey: 'blocker_id', as: 'blocker_info' })
  blocker: User;
  // #######################################
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id: number;
  @BelongsTo(() => User, { foreignKey: 'user_id', as: 'user_info' })
  user: User;
  // #######################################
}

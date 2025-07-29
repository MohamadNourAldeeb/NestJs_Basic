import {
  Table,
  Column,
  DataType,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Language } from 'src/languages/entities/language.entity';

@Table({
  tableName: 'un_registered_users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['_id'],
    },
  ],
})
export class UnRegisteredUser extends Model {
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
    allowNull: false,
    unique: 'device_serial',
  })
  serial: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  fcm_token: string;

  // #######################################
  @ForeignKey(() => Language)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  language_id: number;
  @BelongsTo(() => Language, { foreignKey: 'language_id' })
  language: Language;
  // #######################################
}

import { Table, Column, DataType, Model } from 'sequelize-typescript';
import { enumTypeOfMedia } from 'src/common/enums/enums';

@Table({
  tableName: 'media',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['_id'],
    },
  ],
})
export class Media extends Model {
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
  file_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  base_name: string;

  @Column({
    type: DataType.ENUM(...Object.values(enumTypeOfMedia)),
    allowNull: false,
  })
  type: enumTypeOfMedia;
}

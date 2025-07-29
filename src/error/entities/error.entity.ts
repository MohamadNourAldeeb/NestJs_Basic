import { Table, Column, DataType, Model, HasOne } from 'sequelize-typescript';
import { enumTypeOfError } from 'src/common/enums/enums';

@Table({
  tableName: 'errors',
})
export class Error extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;
  @Column({
    type: DataType.ENUM(...Object.values(enumTypeOfError)),
    allowNull: false,
  })
  type: enumTypeOfError;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status_code: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  message: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  url_path: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  file: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  line: string;
  // #############################
}

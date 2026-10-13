import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'CropDetailType',
    {
      crop_detail_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'crop_details', key: 'id' },
        onDelete: 'CASCADE',
      },
      crop_type_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'crop_types', key: 'id' },
        onDelete: 'RESTRICT',
      },
    },
    { tableName: 'crop_detail_types', underscored: true, timestamps: false }
  );

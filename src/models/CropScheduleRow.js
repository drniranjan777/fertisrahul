import { DataTypes } from 'sequelize';

// stage is a key from config/cropStages.js; position orders the rows within their stage.
export default (sequelize) => {
  const CropScheduleRow = sequelize.define(
    'CropScheduleRow',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      crop_schedule_id: { type: DataTypes.INTEGER, allowNull: false },
      stage: { type: DataTypes.STRING(40), allowNull: false },
      position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      time: { type: DataTypes.STRING(100), allowNull: false },
      product_id: { type: DataTypes.INTEGER, allowNull: false },
      label: { type: DataTypes.STRING(150), allowNull: true },
      applications: { type: DataTypes.STRING(20), allowNull: true },
      dose: { type: DataTypes.STRING(100), allowNull: true },
      quantity: { type: DataTypes.STRING(100), allowNull: false },
    },
    { tableName: 'crop_schedule_rows', underscored: true, timestamps: false }
  );

  CropScheduleRow.associate = (models) => {
    CropScheduleRow.belongsTo(models.CropSchedule, { foreignKey: 'crop_schedule_id', onDelete: 'CASCADE' });
    CropScheduleRow.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product', onDelete: 'RESTRICT' });
  };

  return CropScheduleRow;
};

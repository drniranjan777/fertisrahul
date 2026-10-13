import { DataTypes } from 'sequelize';

// One schedule per crop detail and method; the method is an Application (Drip, Non Drip, Organic).
export default (sequelize) => {
  const CropSchedule = sequelize.define(
    'CropSchedule',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      crop_detail_id: { type: DataTypes.INTEGER, allowNull: false },
      application_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: 'crop_schedules',
      underscored: true,
      timestamps: false,
      indexes: [{ name: 'crop_schedules_method_unique', unique: true, fields: ['crop_detail_id', 'application_id'] }],
    }
  );

  CropSchedule.associate = (models) => {
    CropSchedule.belongsTo(models.CropDetail, { foreignKey: 'crop_detail_id', onDelete: 'CASCADE' });
    CropSchedule.belongsTo(models.Application, { foreignKey: 'application_id', as: 'method', onDelete: 'RESTRICT' });
    CropSchedule.hasMany(models.CropScheduleRow, { foreignKey: 'crop_schedule_id', as: 'rows', onDelete: 'CASCADE' });
  };

  return CropSchedule;
};

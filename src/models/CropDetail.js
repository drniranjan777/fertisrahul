import { DataTypes } from 'sequelize';

// The website crop page for one Crop master row. Its active state and order come from that crop.
export default (sequelize) => {
  const CropDetail = sequelize.define(
    'CropDetail',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      crop_id: { type: DataTypes.INTEGER, allowNull: false },
      image: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.STRING(300), allowNull: false },
    },
    {
      tableName: 'crop_details',
      underscored: true,
      timestamps: true,
      indexes: [{ name: 'crop_details_crop_unique', unique: true, fields: ['crop_id'] }],
    }
  );

  CropDetail.associate = (models) => {
    CropDetail.belongsTo(models.Crop, { foreignKey: 'crop_id', as: 'crop', onDelete: 'RESTRICT' });
    CropDetail.belongsToMany(models.CropType, {
      through: { model: models.CropDetailType, unique: false },
      foreignKey: 'crop_detail_id',
      otherKey: 'crop_type_id',
      as: 'types',
    });
    CropDetail.hasMany(models.CropSchedule, { foreignKey: 'crop_detail_id', as: 'schedules', onDelete: 'CASCADE' });
  };

  return CropDetail;
};

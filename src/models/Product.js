import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Product = sequelize.define(
    'Product',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      category_id: { type: DataTypes.INTEGER, allowNull: false },
      brand_id: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING(150), allowNull: false },
      slug: { type: DataTypes.STRING(160), allowNull: false },
      tagline: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      headline: { type: DataTypes.STRING(200), allowNull: true },
      body: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
      benefits: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      application: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      image: { type: DataTypes.STRING(255), allowNull: true },
      pdf: { type: DataTypes.STRING(255), allowNull: true },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: 'products',
      underscored: true,
      timestamps: true,
      indexes: [{ name: 'products_slug_unique', unique: true, fields: ['slug'] }],
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category', onDelete: 'RESTRICT' });
    Product.belongsTo(models.Brand, { foreignKey: 'brand_id', as: 'brand', onDelete: 'RESTRICT' });
    Product.belongsToMany(models.Application, {
      through: { model: models.ProductApplication, unique: false },
      foreignKey: 'product_id',
      otherKey: 'application_id',
      as: 'applications',
    });
    Product.belongsToMany(models.Crop, {
      through: { model: models.ProductCrop, unique: false },
      foreignKey: 'product_id',
      otherKey: 'crop_id',
      as: 'crops',
    });
    Product.belongsToMany(models.Crop, {
      through: { model: models.ProductRecommendedCrop, unique: false },
      foreignKey: 'product_id',
      otherKey: 'crop_id',
      as: 'recommended_crops',
    });
  };

  return Product;
};

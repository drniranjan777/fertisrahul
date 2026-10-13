import { DataTypes } from 'sequelize';
import { MASTERS } from '../config/masters.js';
import AdminModel from './Admin.js';
import BannerVideoModel from './BannerVideo.js';
import BannerVideoStateModel from './BannerVideoState.js';
import CropDetailModel from './CropDetail.js';
import CropDetailTypeModel from './CropDetailType.js';
import CropScheduleModel from './CropSchedule.js';
import CropScheduleRowModel from './CropScheduleRow.js';
import { defineMaster } from './defineMaster.js';
import HomeBannerModel from './HomeBanner.js';
import ProductModel from './Product.js';
import { defineProductLink } from './ProductLink.js';

export const models = {};

export const initModels = (sequelize) => {
  models.Admin = AdminModel(sequelize);
  MASTERS.forEach(({ model, table }) => {
    models[model] = defineMaster(sequelize, model, table);
  });

  models.Product = ProductModel(sequelize);
  models.ProductApplication = defineProductLink(
    sequelize,
    'ProductApplication',
    'product_applications',
    'application_id',
    'applications'
  );
  models.ProductCrop = defineProductLink(sequelize, 'ProductCrop', 'product_crops', 'crop_id', 'crops');
  models.ProductRecommendedCrop = defineProductLink(
    sequelize,
    'ProductRecommendedCrop',
    'product_recommended_crops',
    'crop_id',
    'crops',
    { position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 } }
  );

  models.CropDetail = CropDetailModel(sequelize);
  models.CropDetailType = CropDetailTypeModel(sequelize);
  models.CropSchedule = CropScheduleModel(sequelize);
  models.CropScheduleRow = CropScheduleRowModel(sequelize);

  models.HomeBanner = HomeBannerModel(sequelize);
  models.BannerVideo = BannerVideoModel(sequelize);
  models.BannerVideoState = BannerVideoStateModel(sequelize);

  Object.values(models).forEach((model) => {
    if (typeof model.associate == 'function') model.associate(models);
  });

  return models;
};

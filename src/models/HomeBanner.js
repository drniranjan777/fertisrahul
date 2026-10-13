import { DataTypes } from 'sequelize';

// The one home page banner: headline and buttons shared by every state.
export default (sequelize) =>
  sequelize.define(
    'HomeBanner',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title_line1: { type: DataTypes.STRING(60), allowNull: false },
      title_line2: { type: DataTypes.STRING(60), allowNull: true },
      title_line3: { type: DataTypes.STRING(60), allowNull: true },
      highlight: { type: DataTypes.STRING(60), allowNull: true },
      primary_label: { type: DataTypes.STRING(40), allowNull: false },
      primary_link: { type: DataTypes.STRING(255), allowNull: false },
      secondary_label: { type: DataTypes.STRING(40), allowNull: true },
      secondary_link: { type: DataTypes.STRING(255), allowNull: true },
    },
    { tableName: 'home_banners', underscored: true, timestamps: true }
  );

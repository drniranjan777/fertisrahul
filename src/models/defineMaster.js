import { DataTypes } from 'sequelize';

export const defineMaster = (sequelize, modelName, tableName) =>
  sequelize.define(
    modelName,
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(120), allowNull: false },
      slug: { type: DataTypes.STRING(140), allowNull: false },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName,
      underscored: true,
      timestamps: true,
      indexes: [{ name: `${tableName}_slug_unique`, unique: true, fields: ['slug'] }],
    }
  );

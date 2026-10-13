import { DataTypes } from 'sequelize';

// Removing a product removes its links; a master that products still use cannot be removed.
export const defineProductLink = (sequelize, modelName, tableName, otherKey, otherTable, extra = {}) =>
  sequelize.define(
    modelName,
    {
      product_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'products', key: 'id' },
        onDelete: 'CASCADE',
      },
      [otherKey]: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: otherTable, key: 'id' },
        onDelete: 'RESTRICT',
      },
      ...extra,
    },
    { tableName, underscored: true, timestamps: false }
  );

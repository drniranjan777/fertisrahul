import { DataTypes } from 'sequelize';
import { ADMIN_STATUS } from '../utils/index.js';

export default (sequelize) =>
  sequelize.define(
    'Admin',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(120), allowNull: false },
      email: {
        type: DataTypes.STRING(160),
        allowNull: false,
        set(value) {
          this.setDataValue('email', String(value).trim().toLowerCase());
        },
      },
      password: { type: DataTypes.STRING(255), allowNull: false },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: ADMIN_STATUS.ACTIVE,
        validate: { isIn: [Object.values(ADMIN_STATUS)] },
      },
      last_login_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: 'admins',
      underscored: true,
      timestamps: true,
      indexes: [{ name: 'admins_email_unique', unique: true, fields: ['email'] }],
      defaultScope: {
        attributes: { exclude: ['password'] },
      },
      scopes: {
        withPassword: { attributes: { include: ['password'] } },
      },
    }
  );

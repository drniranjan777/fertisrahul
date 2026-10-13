import { DataTypes } from 'sequelize';

// A banner background video for some states, or the default for every other state.
// duration, poster and sources are the live converted files; pending_* is an upload waiting for conversion.
export default (sequelize) => {
  const BannerVideo = sequelize.define(
    'BannerVideo',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      is_default: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'processing',
        validate: { isIn: [['processing', 'ready', 'failed']] },
      },
      error: { type: DataTypes.STRING(255), allowNull: true },
      duration: { type: DataTypes.FLOAT, allowNull: true },
      poster: { type: DataTypes.STRING(255), allowNull: true },
      sources: { type: DataTypes.JSONB, allowNull: true },
      pending_video: { type: DataTypes.STRING(255), allowNull: true },
      pending_poster: { type: DataTypes.STRING(255), allowNull: true },
    },
    {
      tableName: 'banner_videos',
      underscored: true,
      timestamps: true,
      indexes: [{ name: 'banner_videos_name_unique', unique: true, fields: ['name'] }],
    }
  );

  BannerVideo.associate = (models) => {
    BannerVideo.belongsToMany(models.State, {
      through: { model: models.BannerVideoState, unique: false },
      foreignKey: 'banner_video_id',
      otherKey: 'state_id',
      as: 'states',
    });
  };

  return BannerVideo;
};

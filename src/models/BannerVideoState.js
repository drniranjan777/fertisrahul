import { DataTypes } from 'sequelize';

// The unique state_id index means a state can only ever have one banner video.
export default (sequelize) =>
  sequelize.define(
    'BannerVideoState',
    {
      banner_video_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'banner_videos', key: 'id' },
        onDelete: 'CASCADE',
      },
      state_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'states', key: 'id' },
        onDelete: 'RESTRICT',
      },
    },
    {
      tableName: 'banner_video_states',
      underscored: true,
      timestamps: false,
      indexes: [{ name: 'banner_video_states_state_unique', unique: true, fields: ['state_id'] }],
    }
  );

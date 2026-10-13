import { models } from '../../models/index.js';

export const findByEmailWithPassword = (email) =>
  models.Admin.scope('withPassword').findOne({ where: { email } });

export const findById = (id) => models.Admin.findByPk(id);

export const markLoggedIn = (id) => models.Admin.update({ last_login_at: new Date() }, { where: { id } });

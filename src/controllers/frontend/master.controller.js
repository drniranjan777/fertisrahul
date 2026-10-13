import * as masterRepo from '../../repositories/frontend/master.repository.js';
import { successResponse } from '../../utils/index.js';

export const listActive =
  ({ model, plural }) =>
  async (req, res) =>
    successResponse(res, `${plural} fetched`, await masterRepo.findActive(model));

import { successResponse, errorResponse, HTTP_STATUS, makeSlug } from '../../utils/index.js';

const NO_SLUG = 'Could not build a slug from the name';

// [{ noun: 'product', count: 2 }, { noun: 'crop detail', count: 1 }] -> '2 products and 1 crop detail use'
export const describeUsers = (users) => {
  const parts = users.map(({ noun, count }) => `${count} ${noun}${count == 1 ? '' : 's'}`);
  const single = users.length == 1 && users[0].count == 1;
  return `${parts.join(' and ')} ${single ? 'uses' : 'use'}`;
};

export const createMasterController = (repo, { singular, plural }) => {
  const noun = singular.toLowerCase();
  const NOT_FOUND = `${singular} not found`;

  const findConflict = async ({ name, slug }, currentId = null) => {
    const byName = name ? await repo.findByName(name) : null;
    if (byName && byName.id != currentId) return `A ${noun} with this name already exists`;

    const bySlug = slug ? await repo.findBySlug(slug) : null;
    if (bySlug && bySlug.id != currentId) return `A ${noun} with this slug already exists`;

    return null;
  };

  const list = async (req, res) =>
    successResponse(res, `${plural} fetched`, await repo.findAll(req.query));

  const getById = async (req, res) => {
    const record = await repo.findById(req.params.id);
    if (!record) return errorResponse(res, NOT_FOUND, null, HTTP_STATUS.NOT_FOUND);
    return successResponse(res, `${singular} fetched`, record);
  };

  const create = async (req, res) => {
    const slug = makeSlug(req.body.slug || req.body.name);
    if (!slug) return errorResponse(res, NO_SLUG, null, HTTP_STATUS.BAD_REQUEST);

    const conflict = await findConflict({ name: req.body.name, slug });
    if (conflict) return errorResponse(res, conflict, null, HTTP_STATUS.CONFLICT);

    const record = await repo.create({ ...req.body, slug });
    return successResponse(res, `${singular} created`, record, HTTP_STATUS.CREATED);
  };

  // An empty or missing slug keeps the current one, so renaming never breaks website filter links.
  const update = async (req, res) => {
    const record = await repo.findById(req.params.id);
    if (!record) return errorResponse(res, NOT_FOUND, null, HTTP_STATUS.NOT_FOUND);

    const payload = { ...req.body };
    if (payload.slug) {
      payload.slug = makeSlug(payload.slug);
      if (!payload.slug) return errorResponse(res, NO_SLUG, null, HTTP_STATUS.BAD_REQUEST);
    } else {
      delete payload.slug;
    }

    const conflict = await findConflict(payload, record.id);
    if (conflict) return errorResponse(res, conflict, null, HTTP_STATUS.CONFLICT);

    return successResponse(res, `${singular} updated`, await repo.update(record, payload));
  };

  const remove = async (req, res) => {
    const record = await repo.findById(req.params.id);
    if (!record) return errorResponse(res, NOT_FOUND, null, HTTP_STATUS.NOT_FOUND);

    const users = await repo.countUsers(record.id);
    if (users.length) {
      return errorResponse(
        res,
        `Can't delete this ${noun}: ${describeUsers(users)} it. Deactivate it instead.`,
        null,
        HTTP_STATUS.CONFLICT
      );
    }

    await repo.remove(record);
    return successResponse(res, `${singular} deleted`);
  };

  return { list, getById, create, update, remove };
};

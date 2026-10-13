export const getPagination = ({ page, limit }) => ({ page, limit, offset: (page - 1) * limit });

export const toPaged = ({ count, rows }, { page, limit }) => ({
  rows,
  totalItems: count,
  totalPages: Math.ceil(count / limit),
  currentPage: page,
});

// "rice, maize" -> ['rice', 'maize'], for the website's comma-separated filter values.
export const toSlugs = (value) => (value ? value.split(',').map((slug) => slug.trim()).filter(Boolean) : []);

// PostgreSQL LIKE/ILIKE treats backslash as the escape character by default.
export const escapeLike = (value) => value.replace(/[\\%_]/g, '\\$&');

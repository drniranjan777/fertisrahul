// Masters that share the name/slug/sort_order/is_active shape.
// Each entry gets a model, admin CRUD routes at /api/v1/admin/<path>
// and a public active list at /api/v1/frontend/<path>.
// usedBy lists the rows that block deleting a master row: `owner` is the column naming
// the product or crop detail that uses it, and `noun` is how the delete message counts them.
const byProduct = (model, field) => ({ model, field, owner: 'product_id', noun: 'product' });
const byCropDetail = (model, field, owner = 'crop_detail_id') => ({ model, field, owner, noun: 'crop detail' });

export const MASTERS = [
  {
    path: 'brands',
    model: 'Brand',
    table: 'brands',
    singular: 'Brand',
    plural: 'Brands',
    usedBy: [{ model: 'Product', field: 'brand_id', owner: 'id', noun: 'product' }],
  },
  {
    path: 'categories',
    model: 'Category',
    table: 'categories',
    singular: 'Category',
    plural: 'Categories',
    usedBy: [{ model: 'Product', field: 'category_id', owner: 'id', noun: 'product' }],
  },
  {
    path: 'applications',
    model: 'Application',
    table: 'applications',
    singular: 'Application',
    plural: 'Applications',
    usedBy: [byProduct('ProductApplication', 'application_id'), byCropDetail('CropSchedule', 'application_id')],
  },
  {
    path: 'crops',
    model: 'Crop',
    table: 'crops',
    singular: 'Crop',
    plural: 'Crops',
    usedBy: [
      byProduct('ProductCrop', 'crop_id'),
      byProduct('ProductRecommendedCrop', 'crop_id'),
      byCropDetail('CropDetail', 'crop_id', 'id'),
    ],
  },
  {
    path: 'crop-types',
    model: 'CropType',
    table: 'crop_types',
    singular: 'Crop type',
    plural: 'Crop Types',
    usedBy: [byCropDetail('CropDetailType', 'crop_type_id')],
  },
  {
    path: 'states',
    model: 'State',
    table: 'states',
    singular: 'State',
    plural: 'States',
    usedBy: [{ model: 'BannerVideoState', field: 'state_id', owner: 'banner_video_id', noun: 'banner video' }],
  },
];

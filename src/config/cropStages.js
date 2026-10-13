// The growth stages of every crop schedule, in website order. The website keeps an icon per key.
export const CROP_STAGES = [
  { key: 'seed-treatment', name: 'Seed Treatment' },
  { key: 'root-and-soil-development', name: 'Root and Soil Development' },
  { key: 'vegetative-growth', name: 'Vegetative Growth' },
  { key: 'flowering-and-fruit-set', name: 'Flowering and Fruit Set' },
  { key: 'crop-development', name: 'Crop Development' },
  { key: 'post-harvest', name: 'Post Harvest' },
];

export const CROP_STAGE_KEYS = CROP_STAGES.map((stage) => stage.key);

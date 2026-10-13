// The 22 crops with a page on https://fertis-web.testlegal.com/crops, in gallery tab order,
// then the crops that only have a page. Types are the gallery tabs each crop appears under.
// Photos are in ./crops. The live site uses one description for every crop.
export const CROP_DESCRIPTION =
  'Introducing a unique crop management program to maximize crop yields and quality, reduce crop losses and maximize crop returns.';

const FIELD = 'Field Crops';
const HORTICULTURAL = 'Horticultural Crops';
const PLANTATION = 'Plantation Crops';
const VEGETABLE = 'Vegetable Crops';

export const CROP_DETAIL_SEEDS = [
  { crop: 'Chilli', image: 'chilli.jpg', types: [FIELD, VEGETABLE] },
  { crop: 'Groundnut', image: 'groundnut.jpg', types: [FIELD] },
  { crop: 'Cotton', image: 'cotton.jpg', types: [FIELD] },
  { crop: 'Maize', image: 'maize.jpg', types: [FIELD] },
  { crop: 'Apple', image: 'apple.jpg', types: [FIELD] },
  { crop: 'Tobacco', image: 'tobacco.jpg', types: [FIELD, PLANTATION] },
  { crop: 'Turmeric', image: 'turmeric.jpg', types: [FIELD] },
  { crop: 'Paddy', image: 'paddy.jpg', types: [FIELD] },
  { crop: 'Potato', image: 'potato.jpg', types: [FIELD, VEGETABLE] },
  { crop: 'Tomato', image: 'tomato.jpg', types: [FIELD, VEGETABLE] },
  { crop: 'Wheat', image: 'wheat.jpg', types: [FIELD] },
  { crop: 'Pomegranate', image: 'pomegranate.jpg', types: [HORTICULTURAL] },
  { crop: 'Grapes', image: 'grapes.jpg', types: [HORTICULTURAL] },
  { crop: 'Banana', image: 'banana.jpg', types: [HORTICULTURAL, PLANTATION] },
  { crop: 'Citrus', image: 'citrus.jpg', types: [HORTICULTURAL] },
  { crop: 'Cardamom', image: 'cardamom.png', types: [PLANTATION] },
  { crop: 'Onion', image: 'onion.jpg', types: [VEGETABLE] },
  { crop: 'Sugarcane', image: 'sugarcane.jpg', types: [] },
  { crop: 'Pulses', image: 'pulses.jpg', types: [] },
  { crop: 'Melons', image: 'melons.jpg', types: [] },
  { crop: 'Cumin', image: 'cumin.png', types: [] },
  { crop: 'Vegetables', image: 'vegetables.png', types: [] },
];

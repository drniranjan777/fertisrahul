// The 11 products on https://fertis-web.testlegal.com/product-portfolio, in site order.
// Names refer to master rows by name; image is a file in ./products.
// body lists plain paragraphs; the seeder stores them as HTML.
// Zetol Sure, Zetol Select and Ecolaid Pulse have no detail content on the site.
const noDetail = { headline: null, body: [], benefits: [], recommended_crops: [], application: [] };
const lines = (...texts) => texts.map((recommendation) => ({ stage: null, recommendation }));

export const PRODUCT_SEEDS = [
  {
    name: 'DORMULIN',
    slug: 'dormulin-bag',
    tagline: "India's First Crop Hygiene Solution",
    description:
      'Crop hygiene solution designed to break passive dormancy caused by disease, nutrition, chemical and environmental stresses.',
    category: 'Crop Defense',
    brand: 'Dormulin',
    applications: ['Non Drip', 'Organic'],
    crops: ['Rice', 'Cotton', 'Chilli'],
    image: 'dormulin-bag.png',
    headline: 'A 5th Generation Novel Nutrients',
    body: [
      'Repeated pesticide use increases pathogen resistance and the need for even more chemical applications, while infected crops still need nutrients to sustain normal physiological function leading to higher chemical residues and reduced produce quality.',
      'Dormulin is a 5th generation Crop Hygiene Nutrition solution that helps maintain cleaner crop surfaces while supplying bio-available nutrients to support plant defence, metabolism, and recovery. Powered by Roxite Technology, it promotes healthier crops under continuous disease pressure while helping reduce repeated pesticide applications.',
    ],
    benefits: [
      'Supplies bio-available nutrients for improved plant performance',
      'Helps suppress fungal and bacterial diseases',
      'Enhances crop yield and produce quality',
      'Reduces pesticide residue load',
    ],
    recommended_crops: ['Grapes', 'Pomegranate', 'Potato', 'Hybrid Paddy', 'Green Chilli', 'Tomato', 'Banana'],
    application: [
      { stage: 'Vegetative:', recommendation: '1 kg in 200 litres water, foliar spray, per acre' },
      { stage: 'Flowering & Fruiting:', recommendation: '1 kg in 200 litres water, foliar spray, per acre' },
    ],
  },
  {
    name: 'AKRE SHIELD',
    slug: 'akre-shield',
    tagline: 'Nitrogen Defence Technology',
    description:
      'Biostimulant nitrogen enhancer that supports eco-friendly crop nutrition, higher yield, and sustainable field performance.',
    category: 'Performance Organics',
    brand: 'Akre Shield',
    applications: ['Drip', 'Organic'],
    crops: ['Chilli', 'Cotton', 'Maize'],
    image: 'akre-shield.png',
    headline: 'Nitrogen Defence Technology',
    body: [
      'Akre Shield is a biostimulant nitrogen enhancer that helps crops use nitrogen more efficiently while supporting eco-friendly field performance.',
      'It is designed to protect nutrient value in the soil and plant, reducing losses and supporting vigorous vegetative growth.',
      'Use it to improve yield potential, crop quality, and sustainable nitrogen management.',
    ],
    benefits: [
      'Improves nitrogen use efficiency in the crop',
      'Supports stronger vegetative growth and canopy development',
      'Helps reduce nutrient losses in the field',
      'Fits organic and drip-based nutrition programmes',
    ],
    recommended_crops: ['Chilli', 'Cotton', 'Maize', 'Rice', 'Vegetables'],
    application: lines(
      'Suitable for drip and organic application programmes.',
      'Apply during active vegetative growth for best nitrogen response.',
      'Follow recommended dose based on crop stage and soil condition.'
    ),
  },
  {
    name: 'INTENSIV',
    slug: 'intensiv',
    tagline: 'Customized Nutrition for Every Crop. Every Stage. Every Field.',
    description:
      'Customized fertilizer programme designed to maximize crop yields through scientific basal and top-dress nutrition.',
    category: 'Customized Fertilizers',
    brand: 'Intensiv',
    applications: ['Drip', 'Non Drip'],
    crops: ['Rice', 'Wheat', 'Potato'],
    image: 'intensiv.png',
    headline: 'Customized Nutrition for Every Crop. Every Stage. Every Field.',
    body: [
      'Intensiv is a customized fertilizer programme built for intensive farming systems that demand precise basal and top-dress nutrition.',
      'It helps match nutrient supply to crop stage, soil condition, and yield target so every field can perform at its potential.',
      'Use Intensiv to maximize crop yields through scientific, stage-wise nutrition.',
    ],
    benefits: [
      'Stage-wise nutrition matched to crop demand',
      'Supports higher yield in intensive production systems',
      'Flexible for drip and non-drip application',
      'Helps improve nutrient use across the season',
    ],
    recommended_crops: ['Rice', 'Wheat', 'Potato', 'Sugarcane', 'Maize'],
    application: lines(
      'Apply as basal and top-dress according to the crop programme.',
      'Suitable for drip and broadcast / non-drip systems.',
      'Adjust dose to soil test results and target yield.'
    ),
  },
  {
    name: 'ECOLAID MICROCYTE SOIL',
    slug: 'ecolaid-microcyte-soil',
    tagline: 'Advanced Root Defense Technology',
    description: 'Advanced root defense technology that supports rhizosphere health and stronger crop establishment.',
    category: 'Microbials',
    brand: 'Ecolaid',
    applications: ['Drip', 'Organic'],
    crops: ['Wheat', 'Maize', 'Potato'],
    image: 'ecolaid-microcyte-soil.png',
    headline: 'Advanced Root Defense Technology',
    body: [
      'Ecolaid Microcyte Soil is an advanced root defense technology that supports rhizosphere health and stronger crop establishment.',
      'It helps crops build a healthier root zone so plants can take up nutrients more effectively from the start.',
      'Use it to protect early growth and improve stand establishment in the field.',
    ],
    benefits: [
      'Supports rhizosphere health and root defense',
      'Improves early crop establishment',
      'Fits drip and organic programmes',
      'Helps crops use soil nutrients more effectively',
    ],
    recommended_crops: ['Wheat', 'Maize', 'Potato', 'Vegetables', 'Pulses'],
    application: lines(
      'Apply through drip or soil application at planting / early growth.',
      'Best used as part of a root-zone nutrition programme.',
      'Follow recommended dose based on crop and soil type.'
    ),
  },
  {
    name: 'TRAIL BLAZE',
    slug: 'trail-blaze',
    tagline: 'Complete Nutrition That Activates Every Seed',
    description: 'Seed-applied nutrition designed to activate every seed and support early crop vigor.',
    category: 'Seed & Seedling Solutions',
    brand: 'Trail Blaze',
    applications: ['Non Drip', 'Organic'],
    crops: ['Chilli', 'Cotton', 'Maize'],
    image: 'trail-blaze.png',
    headline: 'Complete Nutrition That Activates Every Seed',
    body: [
      'Trail Blaze is seed-applied nutrition designed to activate every seed and support early crop vigor.',
      'It helps seedlings get a stronger start so the crop can establish evenly across the field.',
      'Use it where seed treatment and early vigor are critical to yield.',
    ],
    benefits: [
      'Activates seed energy for even germination',
      'Supports early root and shoot vigor',
      'Helps improve crop stand and uniformity',
      'Fits seed and seedling nutrition programmes',
    ],
    recommended_crops: ['Chilli', 'Cotton', 'Maize', 'Vegetables', 'Pulses'],
    application: lines(
      'Apply as a seed treatment before sowing.',
      'Ensure uniform coating for consistent field emergence.',
      'Follow recommended rate per kg of seed.'
    ),
  },
  {
    name: 'IMPHACT PHOCYTE',
    slug: 'imphact-phocyte',
    tagline: 'Making Every Nutrient Work',
    description: 'Proprietary soil and nutrient activator formulated to make every nutrient work harder in the field.',
    category: 'Water Soluble Fertilizers',
    brand: 'Imphact (PhoCyte)',
    applications: ['Drip', 'Non Drip'],
    crops: ['Potato', 'Wheat', 'Rice'],
    image: 'imphact-phocyte.png',
    headline: 'Making Every Nutrient Work',
    body: [
      'Imphact PhoCyte is a proprietary soil and nutrient activator formulated to make every nutrient work harder in the field.',
      'It helps unlock nutrient availability so crops can convert applied fertility into growth and yield.',
      'Use it where farmers want better return from every unit of nutrition.',
    ],
    benefits: [
      'Improves nutrient availability in the root zone',
      'Helps crops convert fertility into yield',
      'Suitable for drip and non-drip programmes',
      'Supports phosphorus-driven early growth',
    ],
    recommended_crops: ['Potato', 'Wheat', 'Rice', 'Vegetables', 'Horticulture'],
    application: lines(
      'Apply through drip or soil application at early crop stages.',
      'Can be used with basal nutrition programmes.',
      'Follow recommended dose for crop and soil type.'
    ),
  },
  {
    name: 'TRACSSURE',
    slug: 'tracssure',
    tagline: 'Carbon-Nitrogen Encapsulated Nutrition for Every Corner of the Field',
    description:
      'Carbon-nitrogen encapsulated nutrition designed to reach every corner of the field with balanced delivery.',
    category: 'Customized Fertilizers',
    brand: 'Tracssure',
    applications: ['Drip', 'Non Drip'],
    crops: ['Maize', 'Wheat', 'Cotton'],
    image: 'tracssure.png',
    headline: 'Carbon-Nitrogen Encapsulated Nutrition for Every Corner of the Field',
    body: [
      'Tracssure is carbon-nitrogen encapsulated nutrition designed to reach every corner of the field with balanced delivery.',
      'It helps maintain nutrient availability across the plot so crops stay uniform from edge to centre.',
      'Use it in customized fertilizer programmes that need even, season-long nutrition.',
    ],
    benefits: [
      'Encapsulated nutrition for even field delivery',
      'Supports balanced crop growth across the plot',
      'Fits drip and non-drip customized programmes',
      'Helps improve yield uniformity',
    ],
    recommended_crops: ['Maize', 'Wheat', 'Cotton', 'Rice', 'Sugarcane'],
    application: lines(
      'Apply as part of the customized fertilizer programme.',
      'Suitable for drip fertigation and soil application.',
      'Follow field-specific dose from the crop plan.'
    ),
  },
  {
    name: 'ACTIN',
    slug: 'actin',
    tagline: 'Advanced Microbial Consortium for Healthier Soils and Better Crop Performance',
    description:
      'Advanced microbial consortium that supports healthier soils and better crop performance from the root zone.',
    category: 'Microbials',
    brand: 'Actin',
    applications: ['Organic', 'Drip'],
    crops: ['Rice', 'Chilli', 'Potato'],
    image: 'actin.png',
    headline: 'Advanced Microbial Consortium for Healthier Soils and Better Crop Performance',
    body: [
      'Actin is an advanced microbial consortium that supports healthier soils and better crop performance from the root zone.',
      'It helps build biological activity in the soil so plants can access nutrients more effectively through the season.',
      'Use it where soil health is the foundation of yield.',
    ],
    benefits: [
      'Builds healthier, more active soils',
      'Supports root-zone microbial activity',
      'Helps improve nutrient cycling and crop performance',
      'Fits organic and drip-based programmes',
    ],
    recommended_crops: ['Rice', 'Chilli', 'Potato', 'Vegetables', 'Horticulture'],
    application: lines(
      'Apply through drip or soil drench at early crop stages.',
      'Best used as part of a soil-health programme.',
      'Follow recommended dose and application interval.'
    ),
  },
  {
    name: 'ZETOL SURE',
    slug: 'zetol-sure',
    tagline: 'Advanced Water Soluble Fertilizers for High Yielding Crops',
    description:
      'Advanced water-soluble nutrition designed to support high-yielding crops with efficient nutrient delivery.',
    category: 'Water Soluble Fertilizers',
    brand: 'Zetol',
    applications: ['Drip', 'Non Drip'],
    crops: ['Rice', 'Wheat', 'Maize'],
    image: 'zetol-sure.png',
    ...noDetail,
  },
  {
    name: 'ZETOL SELECT',
    slug: 'zetol-select',
    tagline: 'Advanced Patented Water Soluble Fertilizers for High Yielding Crops',
    description:
      'Patented water-soluble fertilizer formulated for vegetative and flowering stages in high-yielding crops.',
    category: 'Water Soluble Fertilizers',
    brand: 'Zetol',
    applications: ['Drip', 'Non Drip'],
    crops: ['Cotton', 'Chilli', 'Maize'],
    image: 'zetol-select.png',
    ...noDetail,
  },
  {
    name: 'ECOLAID PULSE',
    slug: 'ecolaid-pulse',
    tagline: 'High analysis, fast acting, easy to use',
    description: 'Performance organic foliar nutrition designed for fast uptake and stronger crop growth.',
    category: 'Performance Organics',
    brand: 'Ecolaid',
    applications: ['Non Drip', 'Organic'],
    crops: ['Chilli', 'Cotton', 'Potato'],
    image: 'ecolaid-pulse.png',
    ...noDetail,
  },
];

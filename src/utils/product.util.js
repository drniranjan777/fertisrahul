import { escapeHtml } from './richText.util.js';

const byPosition = (a, b) => a.ProductRecommendedCrop.position - b.ProductRecommendedCrop.position;

export const toAdminProduct = (product) => {
  const { applications, crops, recommended_crops, ...fields } = product.toJSON();
  return {
    ...fields,
    application_ids: applications.map((row) => row.id),
    crop_ids: crops.map((row) => row.id),
    recommended_crop_ids: [...recommended_crops].sort(byPosition).map((row) => row.id),
  };
};

const bySortOrder = (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name);
const publicLink = ({ name, slug }) => ({ name, slug });

// Empty detail fields fall back to the basic fields, the same way the live site does.
export const toPublicProduct = (product, others) => {
  const p = product.toJSON();
  const applications = [...p.applications].sort(bySortOrder).map(publicLink);
  const crops = [...p.crops].sort(bySortOrder).map(publicLink);
  const recommended = [...p.recommended_crops].sort(byPosition).map(publicLink);
  const fallbackApplication = applications.length
    ? [{ stage: null, recommendation: `Suitable for ${applications.map((a) => a.name).join(' and ')} application.` }]
    : [];

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    tagline: p.tagline,
    description: p.description,
    image: p.image,
    pdf: p.pdf,
    category: publicLink(p.category),
    brand: publicLink(p.brand),
    applications,
    crops,
    headline: p.headline || p.tagline,
    body: p.body || `<p>${escapeHtml(p.description)}</p>`,
    benefits: p.benefits.length ? p.benefits : [p.description],
    recommended_crops: recommended.length ? recommended : crops,
    application: p.application.length ? p.application : fallbackApplication,
    other_products: others,
  };
};

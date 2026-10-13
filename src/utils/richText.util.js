import sanitizeHtml from 'sanitize-html';

// Matches the admin editor toolbar: text formatting, lists and links only.
const RICH_TEXT = {
  allowedTags: ['p', 'br', 'strong', 'b', 'i', 'em', 'u', 'ul', 'ol', 'li', 'a'],
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...(attribs.href && { href: attribs.href }),
        ...(attribs.target == '_blank' && { target: '_blank', rel: 'noopener noreferrer' }),
      },
    }),
  },
};

const hasText = (html) => sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
  .replace(/&nbsp;/g, '')
  .trim() != '';

export const cleanRichText = (html) => {
  const clean = sanitizeHtml(html ?? '', RICH_TEXT).trim();
  return hasText(clean) ? clean : '';
};

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

export const paragraphsToHtml = (paragraphs) => (paragraphs ?? [])
  .filter((text) => text?.trim())
  .map((text) => `<p>${escapeHtml(text.trim())}</p>`)
  .join('');

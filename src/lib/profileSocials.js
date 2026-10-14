/**
 * Social links (Facebook, Instagram, X) are not stored by the API yet, so they are kept in this
 * browser only, per user id. Swap these two functions for API calls once the backend has the fields.
 */
export const SOCIAL_NETWORKS = [
  { key: 'facebook', label: 'Facebook', placeholder: 'Enter link of your Facebook account' },
  { key: 'instagram', label: 'Instagram', placeholder: 'Enter link of your Instagram account' },
  { key: 'x', label: 'X', placeholder: 'Enter link of your X account' },
];

const storageKey = (userId) => `foodist:social-links:${userId}`;

export function loadSocialLinks(userId) {
  if (userId == null) return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey(userId)) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveSocialLinks(userId, links) {
  if (userId == null) return;
  const cleaned = Object.fromEntries(
    SOCIAL_NETWORKS.map(({ key }) => [key, String(links[key] || '').trim()]).filter(([, value]) => value),
  );
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(cleaned));
  } catch {
    /* storage unavailable: links simply are not remembered */
  }
}

/** Accepts only http(s) links so a saved value can never become a javascript: URL. */
export function safeLinkHref(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`;
  try {
    const url = new URL(withScheme);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

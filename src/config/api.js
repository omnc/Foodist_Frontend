/** Backend API base URL. Override with VITE_API_URL for local Workers. */
export const API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'https://foodist_backend.omnc2019.workers.dev';

/** Meal types accepted by the backend Prisma enum (no SNACK). */
export const MEAL_TYPES = [
  { value: 'BREAKFAST', label: 'Breakfast' },
  { value: 'LUNCH', label: 'Lunch' },
  { value: 'DINNER', label: 'Dinner' },
  { value: 'SIDEDISH', label: 'Side dish' },
  { value: 'APPETIZER', label: 'Appetizer' },
  { value: 'DESSERT', label: 'Dessert' },
  { value: 'DRINK', label: 'Drink' },
  { value: 'BREAD', label: 'Bread' },
];

export const mealTypeFromLabel = (label) => {
  const map = {
    Breakfast: 'BREAKFAST',
    Lunch: 'LUNCH',
    Dinner: 'DINNER',
    Snack: 'SIDEDISH',
    Appetizer: 'APPETIZER',
    Dessert: 'DESSERT',
    Drink: 'DRINK',
    Bread: 'BREAD',
    'Side Dish': 'SIDEDISH',
    'Side Dishes': 'SIDEDISH',
  };
  return map[label] || null;
};

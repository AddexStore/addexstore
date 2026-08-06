export const formatPrice = (price, symbol) => {
  if (price === null || price === undefined) return '$0.00';
  const sym = symbol || '$';
  return sym + Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const getCurrencySymbol = (currency) => {
  const symbols = { USD: '$', EUR: '€', GBP: '£', AED: 'د.إ', INR: '₹' };
  const code = (currency || 'USD').toUpperCase();
  return symbols[code] || `${code} `;
};

export const getDiscountPrice = (price, discount) => {
  if (!discount || discount <= 0) return price;
  const discounted = price - (price * discount) / 100;
  return Math.round(discounted * 100) / 100;
};

export const getImageUrl = (path) => {
  if (!path) return '/assets/placeholders/product.svg';
  return path;
};

export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + '...';
};

export const generateId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return timestamp + randomPart;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
};

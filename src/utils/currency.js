export const formatPrice = (price) => {
  // Format with Indian numbering system and Rupee symbol
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}; 
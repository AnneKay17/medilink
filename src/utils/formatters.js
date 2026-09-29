// Utility functions for formatting data

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  // Simple formatting: +27 11 555 0123
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+27 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

export const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'life-threatening':
    case 'severe':
      return 'bg-red-50 border-red-200 text-red-900';
    case 'moderate':
      return 'bg-yellow-50 border-yellow-200 text-yellow-900';
    case 'mild':
      return 'bg-gray-50 border-gray-200 text-gray-900';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-900';
  }
};

export const getSeverityBadgeColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'life-threatening':
    case 'severe':
      return 'bg-red-100 text-red-800';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-800';
    case 'mild':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
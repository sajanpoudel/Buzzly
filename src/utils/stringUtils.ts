export const getInitialsFromEmail = (email: string): string => {
  if (!email) return 'U';

  // Remove everything after @ and split by non-letter characters
  const nameParts = email.split('@')[0].split(/[^a-zA-Z]/);
  
  // Get first letter of first part and first letter of last part (if exists)
  const firstInitial = nameParts[0] ? nameParts[0][0] : '';
  const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : '';
  
  // Combine initials and convert to uppercase
  return (firstInitial + lastInitial).toUpperCase() || 'U';
};

// Helper function to capitalize first letter of each word
export const capitalizeWords = (str: string): string => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Helper function to format email for display
export const formatEmailForDisplay = (email: string): string => {
  const [name] = email.split('@');
  return capitalizeWords(name.replace(/[._-]/g, ' '));
};

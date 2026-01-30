// Check if date matches 05.02.1976 in various formats
export const isSpecialDate = (date: string): boolean => {
  // Remove all non-digit characters and check
  const digits = date.replace(/\D/g, '');
  
  // Check for 05021976 or 050276 (without 19)
  if (digits === '05021976' || digits === '050276') {
    return true;
  }
  
  // Check for 05.02.1976 format
  if (date.includes('05') && date.includes('02') && (date.includes('1976') || date.includes('76'))) {
    // More precise check
    const parts = date.split(/[.\s\/-]/).filter(p => p.length > 0);
    if (parts.length >= 3) {
      const day = parts.find(p => p === '05' || p === '5');
      const month = parts.find(p => p === '02' || p === '2');
      const year = parts.find(p => p === '1976' || p === '76');
      
      if (day && month && year) {
        return true;
      }
    }
  }
  
  return false;
};

// Normalize date string for comparison
export const normalizeDate = (date: string): string => {
  return date.replace(/\D/g, '');
};

// Theme initialization utility
export const initializeTheme = () => {
  // Check for saved theme preference or default to light mode
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
  
  if (shouldUseDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  return shouldUseDark;
};

// Listen for system theme changes
export const setupThemeListener = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e: MediaQueryListEvent) => {
    // Only apply system preference if no manual theme is set
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };
  
  mediaQuery.addEventListener('change', handleChange);
  
  return () => mediaQuery.removeEventListener('change', handleChange);
};
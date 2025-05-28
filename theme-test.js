// Test component to verify theme CSS variables are working
// Place this in your browser console on a public school page to test

function testThemeVariables() {
  const style = getComputedStyle(document.documentElement);
  
  const themeVars = [
    '--theme-primary',
    '--theme-secondary', 
    '--theme-background',
    '--font-primary',
    '--font-display',
    '--container-max-width',
    '--hero-min-height',
    '--card-background',
    '--button-border-radius'
  ];
  
  console.log('🎨 Testing Theme Variables:');
  themeVars.forEach(varName => {
    const value = style.getPropertyValue(varName);
    console.log(`${varName}: ${value || 'NOT SET'}`);
  });
  
  // Test if theme styles element exists
  const themeStyle = document.getElementById('theme-styles');
  console.log(`\n📝 Theme styles element: ${themeStyle ? 'EXISTS' : 'MISSING'}`);
  
  if (themeStyle) {
    console.log(`Theme CSS length: ${themeStyle.textContent?.length || 0} characters`);
  }
}

// Run the test
testThemeVariables();

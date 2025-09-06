export function hexToRGB(hex?: unknown) {
  if (typeof hex !== "string") 
    return null;
  
  const clean = hex.startsWith("#") ? hex.slice(1) : hex;
  const match = clean.match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  
  if (!match) 
    return null;
  
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

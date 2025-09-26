import { hexToRGB } from "./hexToRGB";

// Define type for color objects
interface Color {
  name: string;
  hex: string;
}

/**
 * Returns the name of the color in the list closest to the given hex.
 * @param hex The hex color to match.
 * @param colorList Array of { name, hex } colors.
 * @returns Closest color name
 */
export function closestColorName(hex: string, colorList: Color[]): string {
  const target = hexToRGB(hex);
  if (!target) return "Red";

  let closest = "Red";
  let minDist = Infinity;

  for (const color of colorList) {
    const rgb = hexToRGB(color.hex);
    if (!rgb) continue;

    const dist =
      Math.pow(target.r - rgb.r, 2) +
      Math.pow(target.g - rgb.g, 2) +
      Math.pow(target.b - rgb.b, 2);

    if (dist < minDist) {
      minDist = dist;
      closest = color.name;
    }
  }

  return closest;
}

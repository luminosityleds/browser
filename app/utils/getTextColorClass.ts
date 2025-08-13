export function getTextColorClass(color: string): string {
    switch (color.toLowerCase()) {
        case "red":
            return "text-red-500 [text-shadow:_0_1px_3_rgb(0_0_0_/_30%)]";
          case "green":
            return "text-green-500 [text-shadow:_0_1px_3_rgb(0_0_0_/_30%)]";
          case "blue":
            return "text-blue-500 [text-shadow:_0_1px_3_rgb(0_0_0_/_30%)]";
          case "yellow":
            return "text-yellow-500 [text-shadow:_0_1px_3_rgb(0_0_0_/_30%)]";
          case "purple":
            return "text-purple-500 [text-shadow:_0_1px_3_rgb(0_0_0_/_30%)]";
          case "orange":
            return "text-orange-500 [text-shadow:_0_1px_3_rgb(0_0_0_/_30%)]";
          case "white":
            return "text-white [text-shadow:_0_1px_3_rgb(0_0_0_/_100%)]";
          case "black":
            return "text-black [text-shadow:_0_1px_3_rgb(0_0_0_/_30%)]";
          default:
            return "text-black [text-shadow:_0_1px_3_rgb(0_0_0_/_30%)]";
    }
  }
  
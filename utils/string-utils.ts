
// Capitalizes each word, preserving apostrophes and hyphens.
// Examples: "harry potter and the sorcerer's stone" -> "Harry Potter And The Sorcerer's Stone"
//           "twenty-three" -> "Twenty-Three"
export function capitalizeWords(input: string) {
    if (!input) return input;

    return input
        .trim()
        .split(/\s+/) // split by any whitespace
        .map((word) => {
            // Split on hyphens, capitalize each segment
            const segments = word.split("-");
            const capSegments = segments.map((seg) => {
                if (!seg) return seg;
                // Preserve leading non-letters (e.g., quotes)
                const match = seg.match(/^([^A-Za-z]*)([A-Za-z])(.*)$/);
                if (!match) return seg;
                const [, prefix, firstLetter, rest] = match;
                return prefix + firstLetter.toUpperCase() + rest.toLowerCase();
            });
            return capSegments.join("-");
        })
        .join(" ");
}
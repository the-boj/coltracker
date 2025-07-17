export interface ValidationResult {
  isValid: boolean;
  error?: string;
  parsedNumbers?: number[];
}

/**
 * Parses range input formats like "1-5", "1,3,5-8", and individual numbers
 * @param input - The input string to parse
 * @returns Array of parsed numbers
 */
export function parseRangeInput(input: string): number[] {
  if (!input.trim()) {
    return [];
  }

  const numbers: number[] = [];
  const parts = input.split(",").map((part) => part.trim());

  for (const part of parts) {
    if (part.includes("-")) {
      // Handle range format like "1-5"
      const [start, end] = part.split("-").map((s) => s.trim());
      const startNum = parseInt(start, 10);
      const endNum = parseInt(end, 10);

      if (isNaN(startNum) || isNaN(endNum)) {
        throw new Error(`Invalid range format: ${part}`);
      }

      if (startNum > endNum) {
        throw new Error(
          `Invalid range: start (${startNum}) cannot be greater than end (${endNum})`
        );
      }

      for (let i = startNum; i <= endNum; i++) {
        numbers.push(i);
      }
    } else {
      // Handle individual number
      const num = parseInt(part, 10);
      if (isNaN(num)) {
        throw new Error(`Invalid number: ${part}`);
      }
      numbers.push(num);
    }
  }

  // Remove duplicates and sort
  return [...new Set(numbers)].sort((a, b) => a - b);
}

/**
 * Validates owned input for duplicates, range validity, and format correctness
 * @param input - The input string to validate
 * @param total - The total number of items in the collection
 * @param currentOwned - Currently owned items array
 * @returns Validation result with error messages if invalid
 */
export function validateOwnedInput(
  input: string,
  total: number,
  currentOwned: number[]
): ValidationResult {
  if (!input.trim()) {
    return { isValid: true, parsedNumbers: [] };
  }

  if (total <= 0) {
    return {
      isValid: false,
      error: "Please set a total number of items first",
    };
  }

  try {
    const parsedNumbers = parseRangeInput(input);

    // Check if any numbers are out of range
    const outOfRange = parsedNumbers.filter((num) => num < 1 || num > total);
    if (outOfRange.length > 0) {
      return {
        isValid: false,
        error: `Please enter numbers between 1 and ${total}. Invalid: ${outOfRange.join(", ")}`,
      };
    }

    // Check for duplicates with currently owned items
    const duplicates = parsedNumbers.filter((num) =>
      currentOwned.includes(num)
    );
    if (duplicates.length > 0) {
      const itemText = duplicates.length === 1 ? "Item" : "Items";
      const verbText = duplicates.length === 1 ? "is" : "are";
      return {
        isValid: false,
        error: `${itemText} ${duplicates.join(", ")} ${verbText} already in your collection`,
      };
    }

    return {
      isValid: true,
      parsedNumbers,
    };
  } catch (error) {
    return {
      isValid: false,
      error:
        error instanceof Error
          ? error.message
          : "Please use format: 1,2,5-8 or individual numbers",
    };
  }
}

/**
 * Formats owned items for display in table cells
 * @param owned - Array of owned item numbers
 * @param total - Total number of items (optional)
 * @returns Formatted string for cell display
 */
export function formatOwnedForCell(owned: number[], total?: number): string {
  if (!owned || owned.length === 0) {
    return total ? `0/${total}` : "0";
  }

  const sortedOwned = [...owned].sort((a, b) => a - b);

  // For small lists (≤5 items), show the actual numbers
  if (sortedOwned.length <= 5) {
    const compressed = compressRanges(sortedOwned);
    return total
      ? `${compressed} (${sortedOwned.length}/${total})`
      : compressed;
  }

  // For larger lists, show count format
  return total
    ? `${sortedOwned.length}/${total}`
    : `${sortedOwned.length} items`;
}

/**
 * Formats owned items for display in modal interface
 * @param owned - Array of owned item numbers
 * @returns Formatted string for modal display
 */
export function formatOwnedForModal(owned: number[]): string {
  if (!owned || owned.length === 0) {
    return "No items owned";
  }

  const sortedOwned = [...owned].sort((a, b) => a - b);
  return compressRanges(sortedOwned);
}

/**
 * Compresses consecutive numbers into ranges for display with smart formatting
 * @param numbers - Sorted array of numbers
 * @param options - Formatting options
 * @returns Compressed string representation (e.g., "1-5, 8, 10-12")
 */
function compressRanges(
  numbers: number[],
  options: {
    minRangeSize?: number;
    maxDisplayLength?: number;
    showCount?: boolean;
  } = {}
): string {
  if (numbers.length === 0) return "";
  if (numbers.length === 1) return numbers[0].toString();

  const {
    minRangeSize = 3,
    maxDisplayLength = 50,
    showCount = false,
  } = options;
  const ranges: string[] = [];
  let start = numbers[0];
  let end = numbers[0];

  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] === end + 1) {
      // Continue the current range
      end = numbers[i];
    } else {
      // End the current range and start a new one
      if (start === end) {
        ranges.push(start.toString());
      } else if (end - start + 1 < minRangeSize) {
        // Don't compress small ranges, show individual numbers
        for (let j = start; j <= end; j++) {
          ranges.push(j.toString());
        }
      } else {
        ranges.push(`${start}-${end}`);
      }
      start = numbers[i];
      end = numbers[i];
    }
  }

  // Add the final range
  if (start === end) {
    ranges.push(start.toString());
  } else if (end - start + 1 < minRangeSize) {
    for (let j = start; j <= end; j++) {
      ranges.push(j.toString());
    }
  } else {
    ranges.push(`${start}-${end}`);
  }

  const result = ranges.join(", ");

  // If result is too long, show truncated version with count
  if (result.length > maxDisplayLength) {
    const truncated = result.substring(0, maxDisplayLength - 3) + "...";
    return showCount ? `${truncated} (${numbers.length} items)` : truncated;
  }

  return showCount ? `${result} (${numbers.length} items)` : result;
}

/**
 * Gets tooltip content for cell display when showing compressed format
 * @param owned - Array of owned item numbers
 * @returns Full list formatted for tooltip
 */
export function getTooltipContent(owned: number[]): string {
  if (!owned || owned.length === 0) {
    return "No items owned";
  }

  const sortedOwned = [...owned].sort((a, b) => a - b);
  return `Owned items: ${compressRanges(sortedOwned, { maxDisplayLength: 100, showCount: true })}`;
}

/**
 * Groups consecutive numbers for visual display
 * @param numbers - Array of numbers to group
 * @returns Array of groups with start, end, and items
 */
export function getConsecutiveGroups(numbers: number[]): Array<{
  start: number;
  end: number;
  items: number[];
  isRange: boolean;
}> {
  if (numbers.length === 0) return [];

  const sorted = [...numbers].sort((a, b) => a - b);
  const groups: Array<{
    start: number;
    end: number;
    items: number[];
    isRange: boolean;
  }> = [];

  let currentGroup = {
    start: sorted[0],
    end: sorted[0],
    items: [sorted[0]],
    isRange: false,
  };

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === currentGroup.end + 1) {
      // Continue current group
      currentGroup.end = sorted[i];
      currentGroup.items.push(sorted[i]);
      currentGroup.isRange = currentGroup.items.length >= 3; // 3+ items make a range
    } else {
      // Start new group
      groups.push(currentGroup);
      currentGroup = {
        start: sorted[i],
        end: sorted[i],
        items: [sorted[i]],
        isRange: false,
      };
    }
  }
  groups.push(currentGroup);

  return groups;
}

/**
 * Enhanced formatting for owned items with advanced range compression
 * @param owned - Array of owned item numbers
 * @param options - Formatting options
 * @returns Enhanced formatted string
 */
export function formatOwnedAdvanced(
  owned: number[],
  options: {
    maxLength?: number;
    showRangeCount?: boolean;
    highlightRanges?: boolean;
  } = {}
): string {
  if (!owned || owned.length === 0) {
    return "No items owned";
  }

  const {
    maxLength = 60,
    showRangeCount = false,
    highlightRanges = false,
  } = options;
  const groups = getConsecutiveGroups(owned);

  const parts: string[] = [];
  let rangeCount = 0;

  for (const group of groups) {
    if (group.isRange) {
      rangeCount++;
      const rangeStr = highlightRanges
        ? `[${group.start}-${group.end}]`
        : `${group.start}-${group.end}`;
      parts.push(rangeStr);
    } else {
      parts.push(group.items.join(", "));
    }
  }

  let result = parts.join(", ");

  if (result.length > maxLength) {
    result = result.substring(0, maxLength - 3) + "...";
  }

  if (showRangeCount && rangeCount > 0) {
    result += ` (${rangeCount} range${rangeCount > 1 ? "s" : ""})`;
  }

  return result;
}

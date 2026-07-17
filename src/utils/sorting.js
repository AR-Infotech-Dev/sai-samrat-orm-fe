export const defaultSortConfig = {
  key: "created_by",
  direction: "desc",
};

function normalizeValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return value;
}

function compareValues(left, right) {
  const leftValue = normalizeValue(left);
  const rightValue = normalizeValue(right);

  if (typeof leftValue === "number" && typeof rightValue === "number") {
    return leftValue - rightValue;
  }

  const leftDate = new Date(leftValue);
  const rightDate = new Date(rightValue);
  const bothDatesValid =
    !Number.isNaN(leftDate.getTime()) && !Number.isNaN(rightDate.getTime());

  if (bothDatesValid) {
    return leftDate.getTime() - rightDate.getTime();
  }

  return String(leftValue).localeCompare(String(rightValue), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function sortRows(rows = [], sortConfig = defaultSortConfig) {
  if (!sortConfig?.key) {
    return rows;
  }

  const directionMultiplier = sortConfig.direction === "asc" ? 1 : -1;

  return [...rows].sort((left, right) => {
    const comparison = compareValues(left?.[sortConfig.key], right?.[sortConfig.key]);

    if (comparison !== 0) {
      return comparison * directionMultiplier;
    }

    return compareValues(left?.id, right?.id);
  });
}

export function getNextSortConfig(currentSort, columnKey) {
  if (currentSort?.key !== columnKey) {
    return {
      key: columnKey,
      direction: "asc",
    };
  }

  return {
    key: columnKey,
    direction: currentSort.direction === "asc" ? "desc" : "asc",
  };
}

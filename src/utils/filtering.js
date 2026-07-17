function normalizeValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function toLower(value) {
  return normalizeValue(value).toLowerCase();
}

function isEmptyValue(value) {
  const normalized = normalizeValue(value);
  return normalized === "" || normalized === "-";
}

function parseDateValue(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDate(left, right) {
  return (
    left &&
    right &&
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function matchesDateCondition(rawValue, condition, filterValue) {
  const rowDate = parseDateValue(rawValue);

  if (condition === "is_empty") {
    return !rowDate;
  }

  if (condition === "is_not_empty") {
    return Boolean(rowDate);
  }

  if (!rowDate) {
    return false;
  }

  const today = new Date();
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (condition === "today") {
    return isSameDate(rowDate, currentDate);
  }

  if (condition === "tomorrow") {
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(currentDate.getDate() + 1);
    return isSameDate(rowDate, tomorrow);
  }

  if (condition === "yesterday") {
    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);
    return isSameDate(rowDate, yesterday);
  }

  if (condition === "this_month") {
    return (
      rowDate.getFullYear() === currentDate.getFullYear() &&
      rowDate.getMonth() === currentDate.getMonth()
    );
  }

  if (condition === "this_week") {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return rowDate >= weekStart && rowDate <= weekEnd;
  }

  const selectedDate = parseDateValue(filterValue);
  if (!selectedDate) {
    return true;
  }

  return isSameDate(rowDate, selectedDate);
}

function matchesCondition(rawValue, filter) {
  const { condition = "is_in", value, type } = filter;

  if (type === "date") {
    return matchesDateCondition(rawValue, condition, value);
  }

  if (condition === "is_empty") {
    return isEmptyValue(rawValue);
  }

  if (condition === "is_not_empty") {
    return !isEmptyValue(rawValue);
  }

  const left = toLower(rawValue);
  const right = toLower(value);

  if (!right) {
    return true;
  }

  switch (condition) {
    case "equal_to":
      return left === right;
    case "not_equal_to":
      return left !== right;
    case "start_with":
      return left.startsWith(right);
    case "end_with":
      return left.endsWith(right);
    case "is_in":
    default:
      return left.includes(right);
  }
}

function matchesSearch(row, searchText) {
  if (!searchText) {
    return true;
  }

  const query = searchText.toLowerCase();

  return Object.values(row || {}).some((value) => toLower(value).includes(query));
}

export function applyModuleFilters(rows = [], filterState = {}) {
  const { searchText = "", filters = [] } = filterState;

  return rows.filter((row) => {
    if (!matchesSearch(row, searchText)) {
      return false;
    }

    return filters.every((filter) => matchesCondition(row?.[filter.field], filter));
  });
}

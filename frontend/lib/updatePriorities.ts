export function apply1BasedPriorityToArray(arr: any[]) {
  if (!Array.isArray(arr)) return arr;
  return arr.map((item, idx) => {
    if (item && typeof item === 'object') {
      return { ...item, priority: idx + 1 };
    }
    return item;
  });
}

export function applyPrioritiesRecursively(obj: any): any {
  if (Array.isArray(obj)) {
    // ensure nested objects also get priorities (arrays themselves become empty by default for template creation)
    const normalized = obj.map((v) => (v && typeof v === "object" && !Array.isArray(v) ? applyPrioritiesRecursively(v) : v));
    return apply1BasedPriorityToArray(normalized);
  }
  if (obj && typeof obj === "object") {
    const out: any = {};
    for (const k of Object.keys(obj)) {
      out[k] = applyPrioritiesRecursively(obj[k]);
    }
    return out;
  }
  return obj;
}

export function createItemFromTemplate(template: any) {
  // For arrays, return empty array (don't auto-create blank entries)
  if (Array.isArray(template)) return [];
  if (typeof template === "string") return "";
  if (typeof template === "object" && template !== null) {
    const out: any = {};
    for (const k of Object.keys(template)) {
      if (k === "priority") continue;
      const val = template[k];
      if (Array.isArray(val)) out[k] = [];
      else if (val && typeof val === "object") out[k] = createItemFromTemplate(val);
      else out[k] = "";
    }
    return out;
  }
  return "";
}

export function removeEmptyItemsRecursively(obj: any): any {
  const isEmptyValue = (v: any): boolean => {
    if (v === null || v === undefined) return true;
    if (typeof v === "string") return v.trim() === "";
    if (typeof v === "number") return false;
    if (typeof v === "boolean") return false;
    if (Array.isArray(v)) return v.length === 0 || v.every(isEmptyValue);
    if (typeof v === "object") {
      // consider object empty if all its properties (except internal ones) are empty
      const keys = Object.keys(v).filter((k) => k !== "id" && k !== "priority");
      if (keys.length === 0) return true;
      return keys.every((k) => isEmptyValue(v[k]));
    }
    return false;
  };

  if (Array.isArray(obj)) {
    const cleaned = obj
      .map((v) => (v && typeof v === "object" ? removeEmptyItemsRecursively(v) : v))
      .filter((v) => !isEmptyValue(v));
    return cleaned;
  }
  if (obj && typeof obj === "object") {
    const out: any = {};
    for (const k of Object.keys(obj)) {
      out[k] = removeEmptyItemsRecursively(obj[k]);
    }
    return out;
  }
  return obj;
}

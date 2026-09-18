/**
 * localStorage wrapper that degrades to a no-op when storage isn't usable.
 *
 * Safari with "Block All Cookies" enabled throws just from *reading* `window.localStorage` —
 * and `typeof localStorage` doesn't protect against that either, since `typeof` only special-cases
 * bare undeclared identifiers, not a property access on an object (`window`) that does exist. A
 * try/catch is the only way to probe this, so it's done once here and cached, instead of wrapping
 * every call site in its own catch.
 */
function probeStorage(): Storage | null {
  try {
    const storage = window.localStorage;
    const testKey = "__storage_test__";
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return storage;
  } catch {
    return null;
  }
}

let cached: Storage | null | undefined;

function getStorage(): Storage | null {
  if (cached === undefined) {
    cached = typeof window === "undefined" ? null : probeStorage();
  }
  return cached;
}

export const safeStorage = {
  getItem(key: string): string | null {
    return getStorage()?.getItem(key) ?? null;
  },
  setItem(key: string, value: string): void {
    getStorage()?.setItem(key, value);
  },
  removeItem(key: string): void {
    getStorage()?.removeItem(key);
  },
};

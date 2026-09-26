/**
 * Convert a lodash-style path to the dot path that react-hook-form compares by string.
 * It replaces every `[key]` with `.key` and drops the dot before the bracket.
 */
export function toFieldPath(name: string): string {
  const path = name.replace(/\.?\[([^\]]+)\]/g, ".$1");
  if (path.startsWith(".")) {
    return path.slice(1);
  }
  return path;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

/**
 * Return `next`, but reuse the subtree of `prev` that is deeply equal to the
 * same subtree of `next`.
 *
 * react-hook-form sends a new deep clone of the values on each change. The
 * editor memoizes on the identity of a block. So an unchanged block must keep
 * its identity.
 */
export function replaceEqualDeep<T>(prev: unknown, next: T): T {
  if (prev === next) {
    return prev as T;
  }

  if (Array.isArray(prev) && Array.isArray(next)) {
    const items = next.map((item, index) =>
      replaceEqualDeep(prev[index], item),
    );
    if (
      items.length === prev.length &&
      items.every((item, index) => item === prev[index])
    ) {
      return prev as T;
    }
    return items as unknown as T;
  }

  if (isPlainObject(prev) && isPlainObject(next)) {
    const keys = Object.keys(next);
    const out: Record<string, unknown> = {};
    for (const key of keys) {
      out[key] = replaceEqualDeep(prev[key], next[key]);
    }
    if (
      keys.length === Object.keys(prev).length &&
      keys.every((key) => out[key] === prev[key])
    ) {
      return prev as T;
    }
    if (keys.every((key) => out[key] === next[key])) {
      return next;
    }
    return out as unknown as T;
  }

  return next;
}

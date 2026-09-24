/**
 * Cache keys in one place.
 *
 * Scattered inline arrays are how a mutation ends up invalidating a key that no query uses: the
 * two drift by a character and the screen silently stops refreshing. Naming them once means the
 * compiler catches it.
 */
export const queryKeys = {
  draft: (reference: string) => ["draft", reference] as const,
  categoryAttributes: (slug: string) => ["category-attributes", slug] as const,
  fieldOptions: (slug: string, fieldKey: string, parent?: string | null) =>
    ["field-options", slug, fieldKey, parent ?? null] as const,
} as const;

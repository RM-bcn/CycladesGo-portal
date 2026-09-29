/**
 * The glob loader's entry `id` is the filename *with* its extension, so using it
 * raw produces a URL ending in `.md`. Route slugs come from here instead.
 */
export const slugOf = (id: string): string => id.replace(/\.(md|mdx)$/, '');

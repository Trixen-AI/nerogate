/** Join class names, skipping falsy parts. */
export const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

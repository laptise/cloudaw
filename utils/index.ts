export function toObject<T>(src: T): T {
  return JSON.parse(JSON.stringify(src));
}

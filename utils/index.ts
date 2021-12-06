/**プレインオブジェクトにする
 * @param src 対象
 */
export function toObject<T>(src: T): T {
  return JSON.parse(JSON.stringify(src));
}

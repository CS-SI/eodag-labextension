/**
 * @param date A Date object
 * @returns a string like YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  var local = new Date(date);
  local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return local.toJSON().slice(0, 10);
}

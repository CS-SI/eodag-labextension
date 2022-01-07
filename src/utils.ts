/**
 * Copyright 2022 CS GROUP - France, http://www.c-s.fr
 * All rights reserved
 */

/**
 * @param date A Date object
 * @returns a string like YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const local = new Date(date);
  local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return formatStringDate(local.toJSON());
}

export function formatStringDate(date: string): string {
  return date.slice(0, 10);
}

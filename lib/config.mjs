export const REPOSITORY = 'https://github.com/polyakovin/gamedev-boss-fights';
export const SITE_ORIGIN = 'https://polyakovin.github.io';
export const BASE_PATH = process.env.BASE_PATH ?? '/gamedev-boss-fights/';
if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(BASE_PATH))
  throw new Error('BASE_PATH must start and end with / and contain safe path segments.');
export const link = (path = '') => BASE_PATH + path;
export const canonical = (path = '') => SITE_ORIGIN + link(path);

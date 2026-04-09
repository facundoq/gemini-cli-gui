const projectDirectoryCache = new Map<string, string>();
let cacheTimestamp = Date.now();

export function clearProjectDirectoryCache() {
  projectDirectoryCache.clear();
  cacheTimestamp = Date.now();
}

export { projectDirectoryCache, cacheTimestamp };

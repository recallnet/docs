const API_REFERENCE_PATH = "reference/endpoints";

export function isApiReferencePath(pathOrSlug: string | string[]): boolean {
  const normalizedPath = Array.isArray(pathOrSlug)
    ? pathOrSlug.join("/")
    : pathOrSlug.split(/[/\\]/).join("/");

  return normalizedPath.includes(`${API_REFERENCE_PATH}/`);
}

export function isApiReferenceRootPath(pathOrSlug: string | string[]): boolean {
  if (Array.isArray(pathOrSlug)) {
    return (
      pathOrSlug.length === 2 &&
      pathOrSlug[0] === "reference" &&
      pathOrSlug[1] === "endpoints"
    );
  }

  const normalized = pathOrSlug.split(/[/\\]/).join("/");
  return (
    normalized === API_REFERENCE_PATH ||
    normalized.endsWith(`/${API_REFERENCE_PATH}`) ||
    normalized.endsWith("/index.mdx") && normalized.includes(API_REFERENCE_PATH)
  );
}

export function isApiReferencePage(pathOrSlug: string | string[]): boolean {
  return isApiReferencePath(pathOrSlug) && !isApiReferenceRootPath(pathOrSlug);
}

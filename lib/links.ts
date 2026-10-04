// Public links shown in the app.
export const REPO_URL = "https://github.com/ibo2001/alaa";
export const REVIEW_LOG_URL = `${REPO_URL}/blob/main/sources/REVIEW_LOG.md`;

export function issueUrl(title: string, body: string): string {
  return `${REPO_URL}/issues/new?${new URLSearchParams({ title, body })}`;
}

export async function getMarkdownContent(path: string): Promise<string> {
  try {
    // Remove /docs/ prefix if it exists and add /view/ prefix
    const viewPath = `/view/${path.replace(/^\/docs\//, "")}.md`;
    const response = await fetch(viewPath);

    if (!response.ok) {
      throw new Error(`Failed to fetch markdown content: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error fetching markdown content:", error);
    throw error;
  }
}

/**
 * Utilities for MCP authentication and credential management
 */

export interface MCPCredentials {
  github_token: string;
  expires_at: string | null;
  scopes: string[];
}

/**
 * Fetch GitHub credentials for MCP server
 * This should be called by MCP servers to get authenticated GitHub tokens
 */
export async function fetchMCPCredentials(
  sessionToken: string
): Promise<MCPCredentials | null> {
  try {
    const response = await fetch('/api/mcp/credentials', {
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please sign in again');
      }
      if (response.status === 404) {
        throw new Error('GitHub token not found - Please reconnect your GitHub account');
      }
      throw new Error(`Failed to fetch credentials: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching MCP credentials:', error);
    return null;
  }
}

/**
 * Validate that credentials are still valid (not expired)
 */
export function isCredentialsValid(credentials: MCPCredentials): boolean {
  if (!credentials.expires_at) {
    // No expiration date means token doesn't expire (unlikely for GitHub, but handle it)
    return true;
  }

  const expiresAt = new Date(credentials.expires_at);
  const now = new Date();
  
  // Consider token valid if it expires more than 5 minutes from now
  return expiresAt.getTime() > now.getTime() + 5 * 60 * 1000;
}


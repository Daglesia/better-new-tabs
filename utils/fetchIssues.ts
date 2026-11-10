import type { GiteaConfig } from './storage';

export interface GiteaUser {
  login: string;
  full_name?: string;
  avatar_url?: string;
}

export interface GiteaRepositoryRef {
  id: number;
  name: string;
  owner: string;
  full_name: string;
}

export interface GiteaIssue {
  id: number;
  html_url: string;
  number: number;
  title: string;
  body: string;
  state: string;
  user: GiteaUser;
  repository: GiteaRepositoryRef;
  created_at: string;
  updated_at: string;
}

export async function fetchOpenIssues({ baseUrl, token }: GiteaConfig): Promise<GiteaIssue[]> {
  const response = await fetch(
    `${baseUrl}/api/v1/repos/issues/search?state=open&type=issues`,
    { headers: { Authorization: `token ${token}` } },
  );

  if (response.status === 401 || response.status === 403) {
    throw new Error('Authentication failed. Check your access token.');
  }
  if (!response.ok) {
    throw new Error(`Gitea API request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as GiteaIssue[];
}
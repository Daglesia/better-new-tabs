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

const BASE_URL = import.meta.env.WXT_GITEA_BASE_URL ?? 'https://git.daglesia.com';
const TOKEN = import.meta.env.WXT_GITEA_TOKEN ?? '';

export async function fetchOpenIssues(): Promise<GiteaIssue[]> {
  if (!TOKEN) {
    throw new Error(
      'Missing Gitea API token. Add WXT_GITEA_TOKEN to a .env file at the project root.',
    );
  }

  const response = await fetch(
    `${BASE_URL}/api/v1/repos/issues/search?state=open&type=issues`,
    {
      headers: {
        Authorization: `token ${TOKEN}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Gitea API request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as GiteaIssue[];
}
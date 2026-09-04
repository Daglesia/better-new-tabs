import type { GiteaIssue } from './fetchIssues';

export interface FormattedIssue {
  id: number;
  title: string;
  url: string;
  repoName: string;
  repoFullName: string;
  author: string;
  createdAt: Date;
}

export function formatIssues(issues: GiteaIssue[]): FormattedIssue[] {
  return issues
    .map((issue) => {
      const createdAt = new Date(issue.created_at);
      return {
        id: issue.id,
        title: issue.title,
        url: issue.html_url,
        repoName: issue.repository?.name ?? 'unknown',
        repoFullName: issue.repository?.full_name ?? 'unknown',
        author: issue.user?.login ?? 'unknown',
        createdAt,
      };
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

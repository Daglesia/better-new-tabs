import type { GiteaIssue } from './fetchIssues';

export interface FormattedIssue {
  id: number;
  title: string;
  url: string;
  repoName: string;
  repoFullName: string;
  author: string;
  createdAt: Date;
  relativeTime: string;
}

export interface RepoGroup {
  repoName: string;
  repoFullName: string;
  issues: FormattedIssue[];
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60_000);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/** Maps raw API issues into display-ready shape, newest first. */
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
        relativeTime: formatRelativeTime(createdAt),
      };
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/** Groups already-formatted issues by repository, sorted alphabetically. */
export function groupIssuesByRepo(issues: FormattedIssue[]): RepoGroup[] {
  const map = new Map<string, RepoGroup>();

  for (const issue of issues) {
    const existing = map.get(issue.repoFullName);
    if (existing) {
      existing.issues.push(issue);
    } else {
      map.set(issue.repoFullName, {
        repoName: issue.repoName,
        repoFullName: issue.repoFullName,
        issues: [issue],
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.repoName.localeCompare(b.repoName));
}
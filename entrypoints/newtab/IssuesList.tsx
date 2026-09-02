import { useEffect, useState } from 'react';
import { fetchOpenIssues } from '@/utils/fetchIssues';
import { formatIssues, groupIssuesByRepo, type RepoGroup } from '@/utils/formatIssues';
import '@daglesia/daglesias-library-of-components/scss';

type Status = 'loading' | 'ready' | 'error';

export default function IssuesList() {
  const [groups, setGroups] = useState<RepoGroup[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchOpenIssues()
      .then((issues) => {
        if (cancelled) return;
        setGroups(groupIssuesByRepo(formatIssues(issues)));
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load issues');
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'loading') {
    return <div className="issues-list issues-list--loading">Loading issues…</div>;
  }

  if (status === 'error') {
    return <div className="issues-list issues-list--error">Couldn't load issues: {error}</div>;
  }

  if (groups.length === 0) {
    return <div className="issues-list issues-list--empty">No open issues 🎉</div>;
  }

  return (
    <div className="issues-list">
      {groups.map((group) => (
        <div className="issues-list__repo" key={group.repoFullName}>
          <h3 className="issues-list__repo-name">{group.repoName}</h3>
          <ul className="issues-list__items">
            {group.issues.map((issue) => (
              <li key={issue.id}>
                <a
                  className="dlc-list-item"
                  href={issue.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="dlc-list-item__content">
                    <span className="dlc-list-item__content__title">{issue.title}</span>
                    <span className="dlc-list-item__content__subtitle">
                      {issue.author} · {issue.relativeTime}
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

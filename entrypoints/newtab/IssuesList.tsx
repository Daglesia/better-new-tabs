import { useEffect, useRef, useState } from 'react';
import { fetchOpenIssues } from '@/utils/fetchIssues';
import { formatIssues } from '@/utils/formatIssues';
import '@daglesia/daglesias-library-of-components/scss';

type Status = 'loading' | 'ready' | 'error';

export default function IssuesList() {
  const [issues, setIssues] = useState<FormattedIssue[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let cancelled = false;

    fetchOpenIssues()
      .then((data) => {
        if (cancelled) return;
        setIssues(formatIssues(data));
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

  useEffect(() => {
    if (status !== 'ready' || issues.length === 0) return;
    const container = containerRef.current;
    if (!container) return;

    const expandForMeasurement = () => setVisibleCount(issues.length);

    expandForMeasurement();

    const resizeObserver = new ResizeObserver(expandForMeasurement);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [status, issues]);

  useEffect(() => {
    if (status !== 'ready' || issues.length === 0) return;
    if (visibleCount !== issues.length) return; // only measure the "expanded" pass

    const list = listRef.current;
    if (!list) return;

    const availableHeight = list.clientHeight;
    const items = Array.from(list.children) as HTMLElement[];

    let usedHeight = 0;
    let fitCount = 0;

    for (const item of items) {
      const marginBottom = parseFloat(getComputedStyle(item).marginBottom) || 0;
      const itemHeight = item.offsetHeight + marginBottom;

      if (usedHeight + itemHeight > availableHeight && fitCount > 0) break;

      usedHeight += itemHeight;
      fitCount += 1;
    }

    const clamped = Math.max(1, Math.min(fitCount, issues.length));
    if (clamped !== visibleCount) {
      setVisibleCount(clamped);
    }
  }, [visibleCount, issues, status]);

  if (status === 'loading') {
    return <div className="issues-list issues-list--loading">Loading issues…</div>;
  }

  if (status === 'error') {
    return <div className="issues-list issues-list--error">Couldn't load issues: {error}</div>;
  }

  if (issues.length === 0) {
    return <div className="issues-list issues-list--empty">No open issues 🎉</div>;
  }

  return (
    <div className="widget" ref={containerRef}>
      <ul className="issues-list__items" ref={listRef}>
        {issues.slice(0, visibleCount).map((issue) => (
          <li key={issue.id}>
            <a className="dlc-list-item" href={issue.url} target="_blank" rel="noreferrer">
              <div className="dlc-list-item__content">
                <span className="dlc-list-item__content__title">{issue.title}</span>
                <span className="dlc-list-item__content__subtitle">{issue.repoName}</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
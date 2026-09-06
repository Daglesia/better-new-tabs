import { useEffect, useRef, useState } from 'react';
import { fetchOpenIssues } from '@/utils/fetchIssues';
import { formatIssues } from '@/utils/formatIssues';
import '@daglesia/daglesias-library-of-components/scss';
import Pagination from './Pagination';

type Status = 'loading' | 'ready' | 'error';

export default function IssuesList() {
  const [issues, setIssues] = useState<FormattedIssue[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(0);
  const [page, setPage] = useState(1);
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

  // Reset back to page 1 whenever the underlying issue list changes.
  useEffect(() => {
    setPage(1);
  }, [issues]);

  useEffect(() => {
    if (status !== 'ready' || issues.length === 0) return;
    const container = containerRef.current;
    if (!container) return;

    const expandForMeasurement = () => setItemsPerPage(issues.length);

    expandForMeasurement();

    const resizeObserver = new ResizeObserver(expandForMeasurement);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [status, issues]);

  useEffect(() => {
    if (status !== 'ready' || issues.length === 0) return;
    if (itemsPerPage !== issues.length) return; // only measure the "expanded" pass

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
    if (clamped !== itemsPerPage) {
      setItemsPerPage(clamped);
    }
  }, [itemsPerPage, issues, status]);

  if (status === 'loading') {
    return <div className="issues-list issues-list--loading">Loading issues…</div>;
  }

  if (status === 'error') {
    return <div className="issues-list issues-list--error">Couldn't load issues: {error}</div>;
  }

  if (issues.length === 0) {
    return <div className="issues-list issues-list--empty">No open issues 🎉</div>;
  }

  const effectivePerPage = itemsPerPage || issues.length;
  const totalPages = Math.max(1, Math.ceil(issues.length / effectivePerPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * effectivePerPage;
  const visibleIssues = issues.slice(startIndex, startIndex + effectivePerPage);

  return (
    <div className="widget" ref={containerRef}>
      <div className="widget__header">
        <span>To do list</span>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        )}
      </div>
      <ul className="issues-list__items" ref={listRef}>
        {visibleIssues.map((issue) => (
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
import { useEffect, useRef, useState } from 'react';
import { fetchOpenIssues } from '@/utils/fetchIssues';
import { formatIssues, type FormattedIssue } from '@/utils/formatIssues';
import { giteaConfigItem, type GiteaConfig } from '@/utils/storage';
import '@daglesia/daglesias-library-of-components/scss';
import Pagination from './Pagination';
import GiteaConfigModal from './GiteaConfigModal';

type Status = 'loading' | 'needs-config' | 'ready' | 'error';

export default function IssuesList() {
  const [config, setConfig] = useState<GiteaConfig | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [issues, setIssues] = useState<FormattedIssue[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    giteaConfigItem.getValue().then((saved) => {
      if (saved) {
        setConfig(saved);
      } else {
        setStatus('needs-config');
      }
    });
  }, []);

  // Fetch issues whenever the config changes
  useEffect(() => {
    if (!config) return;
    let cancelled = false;

    setStatus('loading');
    setError(null);

    fetchOpenIssues(config)
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
  }, [config]);

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

  const handleSave = async (next: GiteaConfig) => {
    await giteaConfigItem.setValue(next);
    setConfig(next);
    setModalOpen(false);
  };

  const modal = modalOpen ? (
    <GiteaConfigModal
      initial={config}
      onSave={handleSave}
      onCancel={() => setModalOpen(false)}
    />
  ) : null;

  if (status === 'needs-config') {
    return (
      <div className="widget">
        <div className="widget__header">
          <span>To do list</span>
        </div>
        <p>Connect a Gitea instance to see your open issues.</p>
        <button type="button" onClick={() => setModalOpen(true)}>
          Connect Gitea
        </button>
        {modal}
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="issues-list issues-list--loading">
        Loading issues…
        {modal}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="widget issues-list--error">
        <div className="widget__header">
          <span>To do list</span>
        </div>
        <p>Couldn't load issues: {error}</p>
        <button type="button" onClick={() => setModalOpen(true)}>
          Edit connection
        </button>
        {modal}
      </div>
    );
  }

  const effectivePerPage = itemsPerPage || issues.length || 1;
  const totalPages = Math.max(1, Math.ceil(issues.length / effectivePerPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * effectivePerPage;
  const visibleIssues = issues.slice(startIndex, startIndex + effectivePerPage);

  return (
    <div className="widget" ref={containerRef}>
      <div className="widget__header">
        <span>To do list</span>
        <div className="widget__header-actions">
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          )}
          <button
            type="button"
            className="widget__icon-button"
            onClick={() => setModalOpen(true)}
            aria-label="Gitea connection settings"
          >
            ⚙
          </button>
        </div>
      </div>

      {issues.length === 0 ? (
        <div className="issues-list--empty">No open issues 🎉</div>
      ) : (
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
      )}
      {modal}
    </div>
  );
}
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useMode } from './ModeContext';

interface ServiceConfig {
  name: string;
  url: string;
  /** Optional separate URL to actually ping, if different from the link target (e.g. an API health endpoint) */
  checkUrl?: string;
}

const SERVICES: ServiceConfig[] = [
  { name: 'Gitea', url: 'https://git.daglesia.com' },
  { name: 'Google', url: 'https://www.google.com' },
];

type ServiceState = 'checking' | 'up' | 'down';

const CHECK_TIMEOUT_MS = 5000;

async function checkService(url: string): Promise<ServiceState> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

  try {
    await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    });
    return 'up';
  } catch {
    return 'down';
  } finally {
    clearTimeout(timeout);
  }
}

function deriveName(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export default function HealthCheck() {
  const { mode } = useMode();
  const isEditMode = mode === 'edit';

  const [customServices, setCustomServices] = useState<ServiceConfig[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  const services = useMemo(() => [...SERVICES, ...customServices], [customServices]);

  const [statuses, setStatuses] = useState<Record<string, ServiceState>>(
    () => Object.fromEntries(services.map((s) => [s.name, 'checking'])),
  );

  const runChecks = useCallback(() => {
    setStatuses(Object.fromEntries(services.map((s) => [s.name, 'checking'])));

    services.forEach((service) => {
      checkService(service.checkUrl ?? service.url).then((result) => {
        setStatuses((prev) => ({ ...prev, [service.name]: result }));
      });
    });
  }, [services]);

  useEffect(() => {
    runChecks();
    // Re-run whenever the set of monitored services changes (e.g. one is added).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services.length]);

  const handleClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAddService = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = newUrl.trim();
    if (!trimmed) {
      setAddError('Enter a URL');
      return;
    }

    const normalizedUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    let name: string;
    try {
      // eslint-disable-next-line no-new
      new URL(normalizedUrl); // validate
      name = deriveName(normalizedUrl);
    } catch {
      setAddError('Enter a valid URL');
      return;
    }

    if (services.some((s) => s.url === normalizedUrl)) {
      setAddError('That URL is already being monitored');
      return;
    }

    setCustomServices((prev) => [...prev, { name, url: normalizedUrl }]);
    setNewUrl('');
    setAddError(null);
  };

  return (
    <div className="widget health-check">
      <div className="widget__header">
        <span>Service Health</span>
        <button
          type="button"
          className="health-check__refresh"
          onClick={runChecks}
          aria-label="Refresh health checks"
        >
          ⟳
        </button>
      </div>
      <ul className="health-check__items">
        {services.map((service) => {
          const state = statuses[service.name] ?? 'checking';
          return (
            <li key={service.name}>
              <button
                type="button"
                className="health-check__item"
                onClick={() => handleClick(service.url)}
              >
                <span
                  className={`health-check__status health-check__status--${state}`}
                  aria-hidden="true"
                >
                  {state === 'checking' ? '…' : state === 'up' ? '✓' : '✕'}
                </span>
                <span className="health-check__name">{service.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {isEditMode && (
        <form className="health-check__add-form" onSubmit={handleAddService}>
          <input
            type="text"
            className="health-check__add-input"
            placeholder="Add URL to monitor…"
            value={newUrl}
            onChange={(e) => {
              setNewUrl(e.target.value);
              setAddError(null);
            }}
          />
          <button type="submit" className="health-check__add-button">
            + Add
          </button>
          {addError && <span className="health-check__add-error">{addError}</span>}
        </form>
      )}
    </div>
  );
}
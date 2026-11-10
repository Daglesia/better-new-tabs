import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useMode } from './ModeContext';
import { customServicesItem, type ServiceConfig } from '@/utils/storage';

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

  const [services, setServices] = useState<ServiceConfig[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  // Keyed by URL, so two services on the same host can't collide
  const [statuses, setStatuses] = useState<Record<string, ServiceState>>({});

  const prevMode = useRef(mode);

  // Load saved services once
  useEffect(() => {
    customServicesItem.getValue().then((saved) => {
      setServices(saved);
      setLoaded(true);
    });
  }, []);

  // Save when leaving edit mode
  useEffect(() => {
    if (prevMode.current === 'edit' && mode === 'view') {
      customServicesItem.setValue(services);
    }
    prevMode.current = mode;
  }, [mode, services]);

  const runChecks = useCallback(() => {
    setStatuses(Object.fromEntries(services.map((s) => [s.url, 'checking' as const])));

    services.forEach((service) => {
      checkService(service.checkUrl ?? service.url).then((result) => {
        setStatuses((prev) => ({ ...prev, [service.url]: result }));
      });
    });
  }, [services]);

  // Re-run whenever the set of monitored services changes (added or removed)
  useEffect(() => {
    if (!loaded) return;
    runChecks();
  }, [loaded, runChecks]);

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

    try {
      new URL(normalizedUrl); // validate
    } catch {
      setAddError('Enter a valid URL');
      return;
    }

    if (services.some((s) => s.url === normalizedUrl)) {
      setAddError('That URL is already being monitored');
      return;
    }

    setServices((prev) => [...prev, { name: deriveName(normalizedUrl), url: normalizedUrl }]);
    setNewUrl('');
    setAddError(null);
  };

  const handleRemoveService = (url: string) => {
    setServices((prev) => prev.filter((s) => s.url !== url));
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

      {loaded && services.length === 0 ? (
        <div className="health-check__empty">
          {isEditMode
            ? 'No services yet. Add a URL below.'
            : 'No services yet. Click “Edit layout” to add one.'}
        </div>
      ) : (
        <ul className="health-check__items">
          {services.map((service) => {
            const state = statuses[service.url] ?? 'checking';
            return (
              <li key={service.url} className="health-check__row">
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
                {isEditMode && (
                  <button
                    type="button"
                    className="health-check__remove"
                    onClick={() => handleRemoveService(service.url)}
                    aria-label={`Stop monitoring ${service.name}`}
                  >
                    ×
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

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
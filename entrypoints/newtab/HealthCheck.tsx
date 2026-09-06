import { useCallback, useEffect, useState } from 'react';

interface ServiceConfig {
  name: string;
  url: string;
  /** Optional separate URL to actually ping, if different from the link target (e.g. an API health endpoint) */
  checkUrl?: string;
}

// Edit this list to add/remove the services you want monitored.
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
    // no-cors means we can't read the response body/status for cross-origin
    // requests, but a resolved fetch (even an opaque response) tells us the
    // request reached the server, which is enough for a basic "is it up" check.
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

export default function HealthCheck() {
  const [statuses, setStatuses] = useState<Record<string, ServiceState>>(
    () => Object.fromEntries(SERVICES.map((s) => [s.name, 'checking'])),
  );

  const runChecks = useCallback(() => {
    setStatuses(Object.fromEntries(SERVICES.map((s) => [s.name, 'checking'])));

    SERVICES.forEach((service) => {
      checkService(service.checkUrl ?? service.url).then((result) => {
        setStatuses((prev) => ({ ...prev, [service.name]: result }));
      });
    });
  }, []);

  useEffect(() => {
    runChecks();
  }, [runChecks]);

  const handleClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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
        {SERVICES.map((service) => {
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
    </div>
  );
}
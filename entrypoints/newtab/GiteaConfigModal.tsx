import { useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import type { GiteaConfig } from '@/utils/storage';

interface GiteaConfigModalProps {
  initial: GiteaConfig | null;
  onSave: (config: GiteaConfig) => void | Promise<void>;
  onCancel: () => void;
}

function normalizeBaseUrl(input: string): URL | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withScheme);
  } catch {
    return null;
  }
}

export default function GiteaConfigModal({ initial, onSave, onCancel }: GiteaConfigModalProps) {
  const [url, setUrl] = useState(initial?.baseUrl ?? '');
  const [token, setToken] = useState(initial?.token ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const parsed = normalizeBaseUrl(url);
    if (!parsed) {
      setError('Enter a valid URL');
      return;
    }
    if (!token.trim()) {
      setError('Enter an access token');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Must be the first await so it still counts as a user gesture.
      const granted = await browser.permissions.request({ origins: [`${parsed.origin}/*`] });
      if (!granted) {
        setError(`Permission to access ${parsed.origin} was denied`);
        setSaving(false);
        return;
      }

      // Keep any sub-path (e.g. https://example.com/gitea), drop trailing slashes
      const baseUrl = `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, '');
      await onSave({ baseUrl, token: token.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setSaving(false);
    }
  };

  // Portal: grid tiles use CSS transforms, which would break position: fixed.
  return createPortal(
    <div className="modal-backdrop" onClick={onCancel}>
      <form
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className="modal__title">Connect to Gitea</h2>
        <p className="modal__description">
          Enter the address of your Gitea instance and an access token with read access to issues.
        </p>

        <label className="modal__field">
          <span>Instance URL</span>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://git.example.com"
            autoFocus
          />
        </label>

        <label className="modal__field">
          <span>Access token</span>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Token"
            autoComplete="off"
          />
        </label>

        {error && <div className="modal__error">{error}</div>}

        <div className="modal__actions">
          <button type="button" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="modal__primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
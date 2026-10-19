import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Browser } from 'wxt/browser';

type BookmarkNode = Browser.bookmarks.BookmarkTreeNode;

type Status = 'loading' | 'ready' | 'error';

type DropdownEntry =
  | { kind: 'link'; id: string; title: string; url: string; depth: number }
  | { kind: 'heading'; id: string; title: string; depth: number };

interface BookmarkFolder {
  id: string;
  title: string;
  entries: DropdownEntry[];
}

// Flatten a folder: links first-class, nested folders become headings
function flattenFolder(node: BookmarkNode, depth = 0): DropdownEntry[] {
  const entries: DropdownEntry[] = [];
  for (const child of node.children ?? []) {
    if (child.url) {
      entries.push({
        kind: 'link',
        id: child.id,
        title: child.title || child.url,
        url: child.url,
        depth,
      });
    } else {
      const nested = flattenFolder(child, depth + 1);
      if (nested.length > 0) {
        entries.push({ kind: 'heading', id: child.id, title: child.title, depth });
        entries.push(...nested);
      }
    }
  }
  return entries;
}

// Top-level folders = folders sitting directly inside the root folders
// (Bookmarks bar, Other bookmarks, ...)
function extractFolders(tree: BookmarkNode[]): BookmarkFolder[] {
  const folders: BookmarkFolder[] = [];
  const roots = tree[0]?.children ?? [];
  for (const root of roots) {
    for (const child of root.children ?? []) {
      if (child.url) continue; // plain bookmark, not a folder
      const entries = flattenFolder(child);
      if (entries.length > 0) {
        folders.push({ id: child.id, title: child.title || 'Untitled', entries });
      }
    }
  }
  return folders;
}

interface OpenState {
  folderId: string;
  top: number;
  left: number;
}

export default function BookmarksWidget() {
  const [folders, setFolders] = useState<BookmarkFolder[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<OpenState | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    let cancelled = false;

    browser.bookmarks
      .getTree()
      .then((tree) => {
        if (cancelled) return;
        setFolders(extractFolders(tree));
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load bookmarks');
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const close = useCallback(() => setOpen(null), []);

  // Close on outside click, Escape, resize/scroll
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current?.contains(target)) return;
      // clicking a folder button is handled by its own onClick (toggle)
      for (const btn of buttonRefs.current.values()) {
        if (btn.contains(target)) return;
      }
      close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open, close]);

  // Keep the dropdown inside the viewport horizontally
  useLayoutEffect(() => {
    const el = dropdownRef.current;
    if (!open || !el) return;
    const overflowRight = el.getBoundingClientRect().right - (window.innerWidth - 8);
    if (overflowRight > 0) {
      el.style.left = `${Math.max(8, open.left - overflowRight)}px`;
    }
  }, [open]);

  const toggleFolder = (folderId: string) => {
    if (open?.folderId === folderId) {
      close();
      return;
    }
    const rect = buttonRefs.current.get(folderId)?.getBoundingClientRect();
    if (!rect) return;
    setOpen({ folderId, top: rect.bottom + 4, left: rect.left });
  };

  const openFolder = folders.find((f) => f.id === open?.folderId);

  let body: React.ReactNode;
  if (status === 'loading') {
    body = <div className="bookmarks-widget__message">Loading bookmarks…</div>;
  } else if (status === 'error') {
    body = <div className="bookmarks-widget__message">Couldn't load bookmarks: {error}</div>;
  } else if (folders.length === 0) {
    body = <div className="bookmarks-widget__message">No bookmark folders found</div>;
  } else {
    body = (
      <div className="bookmarks-widget__folders">
        {folders.map((folder) => (
          <button
            key={folder.id}
            type="button"
            ref={(el) => {
              if (el) buttonRefs.current.set(folder.id, el);
              else buttonRefs.current.delete(folder.id);
            }}
            className={`bookmarks-widget__folder${
              open?.folderId === folder.id ? ' bookmarks-widget__folder--open' : ''
            }`}
            aria-expanded={open?.folderId === folder.id}
            onClick={() => toggleFolder(folder.id)}
          >
            📁 {folder.title} <span aria-hidden="true">▾</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="widget bookmarks-widget">
      <div className="widget__header">
        <span>Bookmarks</span>
      </div>
      {body}

      {open &&
        openFolder &&
        createPortal(
          <div
            ref={dropdownRef}
            className="bookmarks-dropdown"
            style={{ top: open.top, left: open.left }}
          >
            {openFolder.entries.map((entry) =>
              entry.kind === 'heading' ? (
                <div
                  key={entry.id}
                  className="bookmarks-dropdown__heading"
                  style={{ paddingLeft: 12 + entry.depth * 12 }}
                >
                  {entry.title}
                </div>
              ) : (
                <a
                  key={entry.id}
                  className="bookmarks-dropdown__link"
                  href={entry.url}
                  title={entry.url}
                  style={{ paddingLeft: 12 + entry.depth * 12 }}
                  onClick={close}
                >
                  {entry.title}
                </a>
              ),
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { notepadItem } from '@/utils/storage';

const SAVE_DELAY_MS = 500;

export default function NotepadWidget() {
  const [text, setText] = useState('');
  const [loaded, setLoaded] = useState(false);
  const latest = useRef('');
  const dirty = useRef(false);

  // Load saved note once
  useEffect(() => {
    notepadItem.getValue().then((saved) => {
      latest.current = saved;
      setText(saved);
      setLoaded(true);
    });
  }, []);

  // Debounced save while typing
  useEffect(() => {
    if (!dirty.current) return;
    const timer = setTimeout(() => {
      notepadItem.setValue(text);
      dirty.current = false;
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [text]);

  // Flush any pending change if the widget is removed or the page unmounts
  useEffect(
    () => () => {
      if (dirty.current) notepadItem.setValue(latest.current);
    },
    [],
  );

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    latest.current = event.target.value;
    dirty.current = true;
    setText(event.target.value);
  };

  return (
    <div className="widget notepad-widget">
      <div className="widget__header">
        <span>Notepad</span>
      </div>
      <textarea
        className="notepad-widget__input"
        value={text}
        onChange={handleChange}
        placeholder={loaded ? 'Write something…' : 'Loading…'}
        disabled={!loaded}
        spellCheck={false}
      />
    </div>
  );
}
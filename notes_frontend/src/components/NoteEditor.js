import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Editor for the selected note.
 * Emits onChange with {title, content}. Debounced updates for better UX.
 */

// PUBLIC_INTERFACE
export default function NoteEditor({ note, onChange, onDelete, isLoading, isSaving }) {
  /** Controlled state synced with selected note. */
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const timer = useRef(null);
  const envMissing = !process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_KEY;

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
  }, [note?.id]); // re-sync when switching notes

  const debouncedEmit = useMemo(
    () => (changes) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        onChange?.(changes);
      }, 300);
    },
    [onChange]
  );

  const handleTitleChange = (e) => {
    const next = e.target.value;
    setTitle(next);
    debouncedEmit({ title: next, content });
  };

  const handleContentChange = (e) => {
    const next = e.target.value;
    setContent(next);
    debouncedEmit({ title, content: next });
  };

  if (!note) {
    return (
      <section className="editor" aria-label="Note editor">
        <div className="helper">Select a note from the list to start editing.</div>
      </section>
    );
  }

  return (
    <section className="editor" aria-label="Note editor">
      <div className="editor-toolbar">
        <div className="helper">
          Editing: <strong>{note.title || 'Untitled'}</strong>{' '}
          <span aria-live="polite" style={{ marginLeft: 8, color: '#6b7280' }}>
            {isSaving ? 'Saving…' : 'All changes saved'}
          </span>
        </div>
        <div>
          <button
            className="btn btn-danger"
            onClick={() => onDelete?.(note.id)}
            aria-label="Delete current note"
            disabled={isLoading || envMissing}
            title={envMissing ? 'Supabase env vars missing' : 'Delete note'}
          >
            Delete
          </button>
        </div>
      </div>
      <label className="helper" htmlFor="note-title">
        Title
      </label>
      <input
        id="note-title"
        className="input"
        placeholder="Title"
        value={title}
        onChange={handleTitleChange}
        aria-label="Note title"
        disabled={envMissing}
      />
      <label className="helper" htmlFor="note-content" style={{ marginTop: 6 }}>
        Content
      </label>
      <textarea
        id="note-content"
        className="textarea"
        placeholder={envMissing ? 'Set Supabase env vars to enable editing.' : 'Write your note here...'}
        value={content}
        onChange={handleContentChange}
        aria-label="Note content"
        disabled={envMissing}
      />
      <span role="status" aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        {isSaving ? 'Saving changes' : 'Changes saved'}
      </span>
    </section>
  );
}

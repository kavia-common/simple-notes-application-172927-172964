import React, { useCallback, useEffect, useRef } from 'react';

/**
 * Renders a list of notes, selectable, with delete and create actions.
 * Basic keyboard navigation: Up/Down to move, Enter to select.
 */

// PUBLIC_INTERFACE
export default function NoteList({
  notes,
  selectedNoteId,
  onSelect,
  onDelete,
  onCreate,
  isLoading,
}) {
  /** Accessible list with keyboard support. */
  const containerRef = useRef(null);
  const envMissing = !process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_KEY;

  const handleKeyDown = useCallback(
    (e) => {
      if (!notes?.length) return;
      const idx = notes.findIndex((n) => n.id === selectedNoteId);
      if (e.key === 'ArrowDown') {
        const next = notes[Math.min(idx + 1, notes.length - 1)];
        if (next) onSelect(next.id);
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        const prev = notes[Math.max(idx - 1, 0)];
        if (prev) onSelect(prev.id);
        e.preventDefault();
      } else if (e.key === 'Enter') {
        const current = notes[idx] || notes[0];
        if (current) onSelect(current.id);
      }
    },
    [notes, selectedNoteId, onSelect]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.addEventListener('keydown', handleKeyDown);
    return () => el && el.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <section className="note-list" aria-label="Notes list">
      <div className="note-list-header">
        <strong>Notes</strong>
        <div>
          <button className="btn btn-primary" onClick={onCreate} aria-label="Create note" disabled={envMissing}>
            + New
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="note-items"
        role="listbox"
        aria-activedescendant={selectedNoteId || undefined}
        tabIndex={0}
      >
        {isLoading && (!notes || notes.length === 0) ? (
          <div className="helper">Loading notes…</div>
        ) : null}
        {notes && notes.length > 0 ? (
          notes.map((note) => {
            const selected = selectedNoteId === note.id;
            return (
              <div
                key={note.id}
                id={note.id}
                className={`note-item ${selected ? 'selected' : ''}`}
                role="option"
                aria-selected={selected}
                tabIndex={-1}
                onClick={() => onSelect(note.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelect(note.id);
                }}
              >
                <div>
                  <div className="note-title">{note.title || 'Untitled'}</div>
                  <div className="note-preview">{(note.content || '').slice(0, 120)}</div>
                </div>
                <div className="note-item-actions">
                  <button
                    className="btn"
                    aria-label={`Delete ${note.title || 'note'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(note.id);
                    }}
                    title="Delete"
                    disabled={envMissing}
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="helper">{envMissing ? 'Supabase env not set. Add env vars to load notes.' : 'No notes yet. Create your first note.'}</div>
        )}
      </div>
    </section>
  );
}

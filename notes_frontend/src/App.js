import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import useNotes from './hooks/useNotes';

/**
 * Root application shell: Ocean Professional themed layout with
 * sidebar (placeholder categories), topbar, note list, and editor.
 * Accessible controls and keyboard navigation basics included.
 */

// Tiny toast system for inline status messages
function Toasts({ toasts, onDismiss }) {
  return (
    <div className="toast-region" role="region" aria-live="polite" aria-label="Status messages">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.variant || ''}`} role="status">
          <span className="toast-title">{t.title}</span>
          <span className="toast-body">{t.message}</span>
          {t.meta ? <div className="toast-meta">{t.meta}</div> : null}
          <button
            className="btn"
            style={{ marginLeft: 8, float: 'right' }}
            aria-label="Dismiss message"
            onClick={() => onDismiss(t.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Application shell wiring notes state to UI components. */
  const {
    notes,
    selectedNoteId,
    selectedNote,
    isLoading,
    isSaving,
    error,
    createNote,
    updateNote,
    deleteNote,
    selectNote,
    refresh,
  } = useNotes();

  // Toast state
  const [toasts, setToasts] = useState([]);
  const idSeq = useRef(0);
  const envMissing = !process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_KEY;

  const pushToast = (payload) => {
    const id = ++idSeq.current;
    const timeout = payload.timeout ?? 2500;
    const toast = { id, ...payload };
    setToasts((prev) => [...prev, toast]);
    if (timeout > 0) {
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, timeout);
    }
  };

  // Keyboard shortcut for creating a new note: Ctrl/⌘ + N
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        if (!envMissing) {
          e.preventDefault();
          createNote({ title: 'Untitled', content: '' });
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [createNote, envMissing]);

  // Announce saving states
  const lastSavingRef = useRef(false);
  useEffect(() => {
    if (isSaving && !lastSavingRef.current) {
      pushToast({ title: 'Saving', message: 'Saving changes…', variant: '', timeout: 1200 });
    } else if (!isSaving && lastSavingRef.current) {
      // Saving finished successfully (if no error)
      if (!error) {
        pushToast({ title: 'Saved', message: 'All changes saved.', variant: 'success', timeout: 1800 });
      }
    }
    lastSavingRef.current = isSaving;
  }, [isSaving, error]);

  // Announce errors
  useEffect(() => {
    if (error) {
      pushToast({ title: 'Error', message: String(error), variant: 'error', timeout: 4000 });
    }
  }, [error]);

  // Wrap create/delete to provide explicit toasts
  const handleCreate = async () => {
    pushToast({ title: 'Create', message: 'Creating note…', timeout: 1000 });
    await createNote({ title: 'Untitled', content: '' });
  };
  const handleDelete = async (id) => {
    pushToast({ title: 'Delete', message: 'Deleting note…', timeout: 1000 });
    await deleteNote(id);
    // Successful delete is already captured by lack of error; add a confirm toast
    pushToast({ title: 'Deleted', message: 'Note deleted.', variant: 'success', timeout: 1600 });
  };

  return (
    <div className="app-root" data-theme="light">
      <Topbar
        onNew={handleCreate}
        onRefresh={refresh}
        isLoading={isLoading}
        isSaving={isSaving}
        error={error}
      />
      <div className="app-content" role="main">
        <Sidebar />
        <div className="main-panel" aria-label="Notes main panel">
          <NoteList
            notes={notes}
            selectedNoteId={selectedNoteId}
            onSelect={selectNote}
            onDelete={handleDelete}
            onCreate={handleCreate}
            isLoading={isLoading}
          />
          <NoteEditor
            note={selectedNote}
            onChange={(changes) =>
              selectedNote &&
              updateNote(selectedNote.id, {
                title: changes.title,
                content: changes.content,
              })
            }
            onDelete={() => selectedNote && handleDelete(selectedNote.id)}
            isLoading={isLoading}
            isSaving={isSaving}
          />
        </div>
      </div>

      {/* Toasts region */}
      <Toasts toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}

export default App;

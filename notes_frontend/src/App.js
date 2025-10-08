import React from 'react';
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

// PUBLIC_INTERFACE
function App() {
  /** Application shell wiring notes state to UI components. */
  const {
    notes,
    selectedNoteId,
    selectedNote,
    isLoading,
    error,
    createNote,
    updateNote,
    deleteNote,
    selectNote,
    refresh,
  } = useNotes();

  return (
    <div className="app-root" data-theme="light">
      <Topbar
        onNew={() => createNote({ title: 'Untitled', content: '' })}
        onRefresh={refresh}
        isLoading={isLoading}
        error={error}
      />
      <div className="app-content" role="main">
        <Sidebar />
        <div className="main-panel" aria-label="Notes main panel">
          <NoteList
            notes={notes}
            selectedNoteId={selectedNoteId}
            onSelect={selectNote}
            onDelete={deleteNote}
            onCreate={() => createNote({ title: 'Untitled', content: '' })}
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
            onDelete={() => selectedNote && deleteNote(selectedNote.id)}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

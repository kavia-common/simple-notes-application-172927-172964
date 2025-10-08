import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock notesService to avoid real network calls
jest.mock('./services/notesService', () => {
  const listNotes = jest.fn(() => Promise.resolve({ data: [], error: null }));
  const createNote = jest.fn(() =>
    Promise.resolve({
      data: { id: '1', title: 'Untitled', content: '', created_at: '', updated_at: '' },
      error: null,
    })
  );
  const updateNote = jest.fn(() =>
    Promise.resolve({
      data: { id: '1', title: 'Updated', content: 'c', created_at: '', updated_at: '' },
      error: null,
    })
  );
  const deleteNote = jest.fn(() =>
    Promise.resolve({
      data: [{ id: '1' }],
      error: null,
    })
  );

  return {
    __esModule: true,
    default: { listNotes, createNote, updateNote, deleteNote },
    listNotes,
    createNote,
    updateNote,
    deleteNote,
  };
});

describe('App integration shell', () => {
  beforeEach(() => {
    process.env.REACT_APP_SUPABASE_URL = 'http://example.com';
    process.env.REACT_APP_SUPABASE_KEY = 'public-key';
    jest.clearAllMocks();

    // Ensure the initial call for the first test resolves to { data: [], error: null }
    const notesService = require('./services/notesService').default;
    if (notesService.listNotes.mock) {
      notesService.listNotes.mockResolvedValue({ data: [], error: null });
    }
  });

  test('renders Topbar with "+ New" and shows loading/empty state then no notes', async () => {
    // Explicitly set the listNotes mock for this test to the desired resolved value
    const notesService = require('./services/notesService').default;
    notesService.listNotes.mockResolvedValueOnce({ data: [], error: null });

    render(<App />);

    // Topbar "+ New" button
    expect(screen.getByRole('button', { name: /create new note/i })).toBeInTheDocument();
    expect(screen.getByText(/simple notes/i)).toBeInTheDocument();

    // NoteList shows initial loading state (since list starts empty and isLoading is true initially)
    expect(screen.getByText(/loading notes…/i)).toBeInTheDocument();

    // After notesService resolves with empty data, we should see the empty state
    await waitFor(() => {
      expect(screen.getByText(/no notes yet\. create your first note\./i)).toBeInTheDocument();
    });
  });

  test('renders error state when notesService rejects', async () => {
    const notesService = require('./services/notesService').default;
    notesService.listNotes.mockResolvedValueOnce({
      data: null,
      error: new Error('Boom'),
    });

    render(<App />);

    await waitFor(() => {
      // Error is displayed in Topbar status bubble; use getAllByRole to avoid ambiguity
      const statuses = screen.getAllByRole('status');
      expect(statuses.some((el) => /boom/i.test(el.textContent || ''))).toBe(true);
    });
  });
});

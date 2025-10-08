import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock notesService to avoid real network calls
jest.mock('./services/notesService', () => ({
  __esModule: true,
  default: {
    listNotes: jest.fn(() => Promise.resolve({ data: [], error: null })),
    createNote: jest.fn(() => Promise.resolve({ data: { id: '1', title: 'Untitled', content: '', created_at: '', updated_at: '' }, error: null })),
    updateNote: jest.fn(() => Promise.resolve({ data: { id: '1', title: 'Updated', content: 'c', created_at: '', updated_at: '' }, error: null })),
    deleteNote: jest.fn(() => Promise.resolve({ data: [{ id: '1' }], error: null })),
  },
  listNotes: jest.fn(() => Promise.resolve({ data: [], error: null })),
  createNote: jest.fn(() => Promise.resolve({ data: { id: '1', title: 'Untitled', content: '', created_at: '', updated_at: '' }, error: null })),
  updateNote: jest.fn(() => Promise.resolve({ data: { id: '1', title: 'Updated', content: 'c', created_at: '', updated_at: '' }, error: null })),
  deleteNote: jest.fn(() => Promise.resolve({ data: [{ id: '1' }], error: null })),
}));

describe('App integration shell', () => {
  beforeEach(() => {
    process.env.REACT_APP_SUPABASE_URL = 'http://example.com';
    process.env.REACT_APP_SUPABASE_KEY = 'public-key';
    jest.clearAllMocks();
  });

  test('renders Topbar with "+ New" and shows loading/empty state then no notes', async () => {
    render(<App />);

    // Topbar "+ New" button
    expect(screen.getByRole('button', { name: /create new note/i })).toBeInTheDocument();
    expect(screen.getByText(/simple notes/i)).toBeInTheDocument();

    // NoteList shows initial loading state (since list starts empty and isLoading is true initially)
    // Loading text is rendered by NoteList when isLoading && notes is empty
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
      // Error is displayed in Topbar status bubble (since Topbar receives error from useNotes)
      expect(screen.getByRole('status')).toHaveTextContent(/boom/i);
    });
  });
});

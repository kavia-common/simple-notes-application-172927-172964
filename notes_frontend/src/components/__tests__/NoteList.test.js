import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NoteList from '../NoteList';

describe('NoteList', () => {
  beforeEach(() => {
    process.env.REACT_APP_SUPABASE_URL = 'http://example.com';
    process.env.REACT_APP_SUPABASE_KEY = 'public-key';
  });

  test('renders provided notes with titles and previews', () => {
    const notes = [
      { id: 'a', title: 'First', content: 'Hello world' },
      { id: 'b', title: 'Second', content: 'Another content' },
    ];

    render(
      <NoteList
        notes={notes}
        selectedNoteId={null}
        onSelect={() => {}}
        onDelete={() => {}}
        onCreate={() => {}}
        isLoading={false}
      />
    );

    expect(screen.getByText(/notes/i)).toBeInTheDocument();
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText(/hello world/i)).toBeInTheDocument();
    expect(screen.getByText(/another content/i)).toBeInTheDocument();
  });

  test('invokes onSelect when a note item is clicked', () => {
    const notes = [{ id: 'a', title: 'First', content: 'Hello world' }];
    const onSelect = jest.fn();

    render(
      <NoteList
        notes={notes}
        selectedNoteId={null}
        onSelect={onSelect}
        onDelete={() => {}}
        onCreate={() => {}}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByText('First'));
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  test('shows loading state only when loading and notes are empty', () => {
    const { rerender } = render(
      <NoteList
        notes={[]}
        selectedNoteId={null}
        onSelect={() => {}}
        onDelete={() => {}}
        onCreate={() => {}}
        isLoading={true}
      />
    );

    expect(screen.getByText(/loading notes…/i)).toBeInTheDocument();

    rerender(
      <NoteList
        notes={[{ id: '1', title: 'X', content: '' }]}
        selectedNoteId={null}
        onSelect={() => {}}
        onDelete={() => {}}
        onCreate={() => {}}
        isLoading={true}
      />
    );
    // When notes exist, loading indicator is not shown
    expect(screen.queryByText(/loading notes…/i)).not.toBeInTheDocument();
  });
});

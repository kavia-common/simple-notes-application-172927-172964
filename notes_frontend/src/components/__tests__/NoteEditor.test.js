import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import NoteEditor from '../NoteEditor';

describe('NoteEditor', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    process.env.REACT_APP_SUPABASE_URL = 'http://example.com';
    process.env.REACT_APP_SUPABASE_KEY = 'public-key';
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders helper when no note is selected', () => {
    render(<NoteEditor note={null} onChange={() => {}} onDelete={() => {}} isLoading={false} isSaving={false} />);
    expect(screen.getByText(/select a note from the list to start editing/i)).toBeInTheDocument();
  });

  test('renders title and content and reflects initial values', () => {
    const note = { id: '1', title: 'My title', content: 'My content' };
    render(<NoteEditor note={note} onChange={() => {}} onDelete={() => {}} isLoading={false} isSaving={false} />);

    expect(screen.getByLabelText(/note title/i)).toHaveValue('My title');
    expect(screen.getByLabelText(/note content/i)).toHaveValue('My content');
    expect(screen.getByText(/all changes saved/i)).toBeInTheDocument();
  });

  test('updates fields and calls onChange debounced on input', () => {
    const note = { id: '1', title: 'T', content: 'C' };
    const onChange = jest.fn();
    render(<NoteEditor note={note} onChange={onChange} onDelete={() => {}} isLoading={false} isSaving={false} />);

    const titleInput = screen.getByLabelText(/note title/i);
    const contentTextarea = screen.getByLabelText(/note content/i);

    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    fireEvent.change(contentTextarea, { target: { value: 'New Content' } });

    // Advance timers to flush debounce (300ms)
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onChange).toHaveBeenLastCalledWith({ title: 'New Title', content: 'New Content' });
  });

  test('delete button triggers onDelete', () => {
    const note = { id: '1', title: 'T', content: 'C' };
    const onDelete = jest.fn();
    render(<NoteEditor note={note} onChange={() => {}} onDelete={onDelete} isLoading={false} isSaving={false} />);

    fireEvent.click(screen.getByRole('button', { name: /delete current note/i }));
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  test('disables inputs and actions when Supabase env vars missing', () => {
    process.env.REACT_APP_SUPABASE_URL = '';
    process.env.REACT_APP_SUPABASE_KEY = '';

    const note = { id: '1', title: 'T', content: 'C' };
    render(<NoteEditor note={note} onChange={() => {}} onDelete={() => {}} isLoading={false} isSaving={false} />);

    expect(screen.getByLabelText(/note title/i)).toBeDisabled();
    expect(screen.getByLabelText(/note content/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /delete current note/i })).toBeDisabled();
  });
});

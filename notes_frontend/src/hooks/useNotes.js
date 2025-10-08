import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import notesService from '../services/notesService';

/**
 * useNotes manages notes list, selection, and optimistic CRUD.
 * It uses the notesService (Supabase) and handles errors gracefully.
 */

// PUBLIC_INTERFACE
export default function useNotes() {
  /**
   * Manage list of notes, selection, loading and error state.
   * PUBLIC_INTERFACE: returns { notes, selectedNoteId, selectedNote, isLoading, isSaving, error, createNote, updateNote, deleteNote, selectNote, refresh }
   */
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const pending = useRef(new Map()); // track optimistic operations by id

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    // Make the hook resilient to undefined or unexpected results from notesService.listNotes
    const res = await notesService.listNotes();
    const { data, error: err } = res || {};
    if (err) {
      setError(err.message || String(err));
    }
    setNotes(Array.isArray(data) ? data : []);
    setIsLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  // PUBLIC_INTERFACE
  const selectNote = useCallback((id) => {
    /** Select a note by id, or null to clear. */
    setSelectedNoteId(id || null);
  }, []);

  // PUBLIC_INTERFACE
  const refresh = useCallback(() => {
    /** Refresh the notes list from source. */
    return load();
  }, [load]);

  // PUBLIC_INTERFACE
  const createNote = useCallback(async ({ title, content }) => {
    /** Optimistically add a new note. */
    setError(null);
    setIsSaving(true);
    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const optimistic = { id: tempId, title: title || 'Untitled', content: content || '', created_at: now, updated_at: now };
    setNotes((prev) => [optimistic, ...prev]);
    setSelectedNoteId(tempId);
    pending.current.set(tempId, 'create');

    const { data, error: err } = await notesService.createNote({ title: optimistic.title, content: optimistic.content });
    if (err || !data) {
      // rollback remove temp
      setNotes((prev) => prev.filter((n) => n.id !== tempId));
      if (selectedNoteId === tempId) setSelectedNoteId(null);
      setError(err?.message || 'Failed to create note.');
      pending.current.delete(tempId);
      setIsSaving(false);
      return;
    }
    // replace temp with real
    setNotes((prev) => {
      const withoutTemp = prev.filter((n) => n.id !== tempId);
      return [data, ...withoutTemp];
    });
    setSelectedNoteId(data.id);
    pending.current.delete(tempId);
    setIsSaving(false);
  }, [selectedNoteId]);

  // PUBLIC_INTERFACE
  const updateNote = useCallback(async (id, { title, content }) => {
    /** Optimistically update the note fields. */
    if (!id) return;
    setError(null);
    setIsSaving(true);
    const prev = notes.find((n) => n.id === id);
    if (!prev) {
      setIsSaving(false);
      return;
    }
    const next = { ...prev };
    if (typeof title !== 'undefined') next.title = title;
    if (typeof content !== 'undefined') next.content = content;
    next.updated_at = new Date().toISOString();

    setNotes((list) => list.map((n) => (n.id === id ? next : n)));
    pending.current.set(id, 'update');

    const { data, error: err } = await notesService.updateNote(id, { title: next.title, content: next.content });
    if (err || !data) {
      // rollback
      setNotes((list) => list.map((n) => (n.id === id ? prev : n)));
      setError(err?.message || 'Failed to update note.');
      pending.current.delete(id);
      setIsSaving(false);
      return;
    }
    setNotes((list) => list.map((n) => (n.id === id ? data : n)));
    pending.current.delete(id);
    setIsSaving(false);
  }, [notes]);

  // PUBLIC_INTERFACE
  const deleteNote = useCallback(async (id) => {
    /** Optimistically delete a note by id. */
    if (!id) return;
    setError(null);
    setIsSaving(true);
    const prevList = notes;
    setNotes((list) => list.filter((n) => n.id !== id));
    if (selectedNoteId === id) setSelectedNoteId(null);
    pending.current.set(id, 'delete');

    const { error: err } = await notesService.deleteNote(id);
    if (err) {
      // rollback
      setNotes(prevList);
      setError(err.message || 'Failed to delete note.');
      pending.current.delete(id);
      setIsSaving(false);
      return;
    }
    pending.current.delete(id);
    setIsSaving(false);
  }, [notes, selectedNoteId]);

  return {
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
  };
}

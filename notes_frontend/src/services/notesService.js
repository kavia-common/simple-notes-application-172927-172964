/**
 * Notes service layer for interacting with the 'notes' table in Supabase.
 * Table schema assumed:
 * - id: uuid (primary key)
 * - title: text
 * - content: text
 * - created_at: timestamptz (default now())
 * - updated_at: timestamptz (managed in app or db trigger)
 */

import supabase from '../lib/supabaseClient';

/**
 * @typedef {Object} Note
 * @property {string} id - UUID identifier for the note
 * @property {string} title - Title of the note
 * @property {string} content - Content/body of the note
 * @property {string} created_at - ISO timestamp when the note was created
 * @property {string} updated_at - ISO timestamp when the note was last updated
 */

/**
 * Wrap Supabase calls to standardize return shape.
 * @template T
 * @param {Promise<{ data: T, error: import('@supabase/supabase-js').PostgrestError }>} promise
 * @returns {Promise<{ data: T|null, error: Error|null }>}
 */
async function handle(promise) {
  const { data, error } = await promise;
  if (error) {
    // eslint-disable-next-line no-console
    console.error('Supabase error:', error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

// PUBLIC_INTERFACE
export async function listNotes() {
  /**
   * Fetch all notes ordered by created_at descending.
   * @returns {Promise<{ data: Note[] | null, error: Error | null }>}
   */
  return handle(
    supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
  );
}

// PUBLIC_INTERFACE
export async function getNoteById(id) {
  /**
   * Fetch a single note by id.
   * @param {string} id - UUID of the note
   * @returns {Promise<{ data: Note | null, error: Error | null }>}
   */
  if (!id) return { data: null, error: new Error('id is required') };
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Supabase error:', error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
}

// PUBLIC_INTERFACE
export async function createNote({ title, content }) {
  /**
   * Create a new note.
   * @param {{ title: string, content: string }} payload
   * @returns {Promise<{ data: Note | null, error: Error | null }>}
   */
  if (!title) return { data: null, error: new Error('title is required') };
  const now = new Date().toISOString();
  return handle(
    supabase
      .from('notes')
      .insert([{ title, content: content || '', created_at: now, updated_at: now }])
      .select()
      .single()
  );
}

// PUBLIC_INTERFACE
export async function updateNote(id, { title, content }) {
  /**
   * Update an existing note by id.
   * @param {string} id - UUID of the note
   * @param {{ title?: string, content?: string }} payload
   * @returns {Promise<{ data: Note | null, error: Error | null }>}
   */
  if (!id) return { data: null, error: new Error('id is required') };
  const updates = { updated_at: new Date().toISOString() };
  if (typeof title !== 'undefined') updates.title = title;
  if (typeof content !== 'undefined') updates.content = content;

  return handle(
    supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  );
}

// PUBLIC_INTERFACE
export async function deleteNote(id) {
  /**
   * Delete a note by id.
   * @param {string} id - UUID of the note
   * @returns {Promise<{ data: { id: string }[] | null, error: Error | null }>}
   */
  if (!id) return { data: null, error: new Error('id is required') };
  // Return the deleted row(s) if needed by selecting
  return handle(
    supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .select('id')
  );
}

export default {
  listNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
};

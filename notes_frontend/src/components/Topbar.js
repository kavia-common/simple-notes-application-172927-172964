import React from 'react';

/**
 * Topbar with brand, actions, and status indicators.
 * - New note
 * - Refresh
 * - Error banner if any
 */

// PUBLIC_INTERFACE
export default function Topbar({ onNew, onRefresh, isLoading, error }) {
  /** Renders brand and actions. */
  return (
    <header className="topbar" role="banner" aria-label="Application top bar">
      <div className="brand" aria-label="Simple Notes">
        <span className="brand-badge" aria-hidden="true" />
        Simple Notes
      </div>
      <div className="actions">
        <button className="btn btn-primary" onClick={onNew} aria-label="Create new note">
          + New
        </button>
        <button
          className="btn"
          onClick={onRefresh}
          aria-label="Refresh notes"
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing…' : 'Refresh'}
        </button>
        <span className="kbd" aria-hidden="true">Ctrl/⌘ + N</span>
      </div>
      {error ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '-28px',
            transform: 'translateX(-50%)',
            background: '#fff',
            border: '1px solid rgba(239,68,68,0.35)',
            color: '#b91c1c',
            padding: '6px 10px',
            borderRadius: '8px',
            boxShadow: '0 6px 16px rgba(239,68,68,0.15)',
            fontSize: 12,
          }}
        >
          {String(error)}
        </div>
      ) : null}
    </header>
  );
}

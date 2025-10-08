import React from 'react';

/**
 * Sidebar placeholder for future categories/tags.
 * Uses Ocean Professional styling via App.css.
 */

// PUBLIC_INTERFACE
export default function Sidebar() {
  /** Simple placeholder sidebar with accessible semantics. */
  return (
    <aside className="sidebar" aria-label="Sidebar categories">
      <h2>Categories</h2>
      <div className="sidebar-placeholder" role="list">
        <span role="listitem" className="sidebar-pill" aria-label="All notes">
          All notes
        </span>
        <span role="listitem" className="sidebar-pill" aria-label="Starred">
          Starred
        </span>
        <span role="listitem" className="sidebar-pill" aria-label="Archived">
          Archived
        </span>
      </div>
    </aside>
  );
}

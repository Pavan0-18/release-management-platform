import React from 'react';
import { Outlet } from 'react-router-dom';
import { ProjectSidebar } from './ProjectSidebar';

export const AppLayout: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* Full-Height Left Sidebar */}
      <ProjectSidebar />

      {/* Right Main Scrollable Viewport */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        <main
          style={{
            flex: 1,
            padding: '1.5rem 2rem',
            maxWidth: '1200px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

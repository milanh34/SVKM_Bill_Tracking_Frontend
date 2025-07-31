import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header'; // Import your Header component

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
      {/* Header at top */}
      <Header />

      {/* Main content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
          textAlign: 'center',
          color: '#333',
        }}
      >
        <div 
          style={{
            maxWidth: '450px',
            backgroundColor: 'white',
            padding: '2.5rem 3rem',
            borderRadius: '12px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            border: '1px solid #e2e8f0',
          }}
        >
          <h1 style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '2rem', fontWeight: '700' }}>
            Unauthorized Access
          </h1>

          <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
            You do not have permission to access this page.
          </p>

          <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '2rem' }}>
            If you think this is a mistake, try logging in with a different role.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: '0.6rem 1.4rem',
                borderRadius: '8px',
                border: '1px solid #6b7280',
                backgroundColor: 'white',
                color: '#374151',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
            >
              Go Back
            </button>

            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '0.6rem 1.4rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#2563eb';
              }}
            >
              Login Again
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UnauthorizedPage;

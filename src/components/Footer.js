import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <div className="container-fluid bg-dark text-light py-4 mt-5 border-top border-secondary shadow-lg">
      <footer className="d-flex flex-column align-items-center justify-content-center text-center">
        <div className="mb-2">
          <Link to="/" className="text-decoration-none lh-1 fs-4 fw-bold">
            <span style={{ color: '#ffc107', letterSpacing: '1px' }}>FooD</span>
            <span style={{ color: '#198754', letterSpacing: '1px' }}>City</span>
          </Link>
        </div>
        <div className="text-muted small">
          <span style={{ color: '#adb5bd', fontSize: '0.9rem', fontWeight: '500' }}>
            © 2021 <span style={{ color: '#ffc107', fontWeight: 'bold' }}>FooD City</span>, Inc. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}

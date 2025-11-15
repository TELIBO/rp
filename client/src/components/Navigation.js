import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, FileSearch } from 'lucide-react';
import './Navigation.css';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="library-nav">
      <div className="nav-content">
        <Link to="/" className="nav-brand">
          <BookOpen size={32} />
          <div className="brand-text">
            <span className="brand-title">Marketing Library</span>
            <span className="brand-subtitle">Knowledge Archive</span>
          </div>
        </Link>

        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <BookOpen size={18} />
            Home
          </Link>
          <Link 
            to="/documents" 
            className={`nav-link ${location.pathname === '/documents' ? 'active' : ''}`}
          >
            <FileSearch size={18} />
            Documents
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

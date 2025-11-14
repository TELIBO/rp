import React, { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import Filters from './components/Filters';
import Statistics from './components/Statistics';
import UploadModal from './components/UploadModal';
import api from './services/api';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    extension: '',
    category: '',
    project: '',
    team: '',
    dateFrom: '',
    dateTo: ''
  });
  const [availableFilters, setAvailableFilters] = useState({
    categories: [],
    projects: [],
    teams: [],
    extensions: []
  });
  const [stats, setStats] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    loadFilters();
    loadStats();
  }, []);

  const loadFilters = async () => {
    try {
      const data = await api.getFilters();
      setAvailableFilters(data);
    } catch (error) {
      console.error('Failed to load filters:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      return;
    }

    setLoading(true);
    setSearchQuery(query);
    setHasSearched(true);

    try {
      const data = await api.search(query, filters);
      setSearchResults(data.results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Re-run search if we have a query
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  const handleUploadComplete = () => {
    loadFilters();
    loadStats();
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>📚 Marketing Knowledge Hub</h1>
          <p className="subtitle">Find documents and assets instantly</p>
        </div>
        <button 
          className="upload-btn"
          onClick={() => setShowUploadModal(true)}
        >
          Upload Files
        </button>
      </header>

      <main className="app-main">
        <SearchBar onSearch={handleSearch} />

        {stats && !hasSearched && (
          <Statistics stats={stats} />
        )}

        {hasSearched && (
          <div className="search-content">
            <Filters
              filters={filters}
              availableFilters={availableFilters}
              onChange={handleFilterChange}
            />
            <SearchResults
              results={searchResults}
              loading={loading}
              query={searchQuery}
            />
          </div>
        )}
      </main>

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </div>
  );
}

export default App;

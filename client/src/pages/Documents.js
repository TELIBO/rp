import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import Filters from '../components/Filters';
import UploadModal from '../components/UploadModal';
import api from '../services/api';
import { Upload } from 'lucide-react';
import './Documents.css';

function Documents() {
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
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const data = await api.getFilters();
      setAvailableFilters(data);
    } catch (error) {
      console.error('Failed to load filters:', error);
    }
  };

  const handleSearch = async (query, customFilters = null) => {
    if (!query.trim()) {
      return;
    }

    setLoading(true);
    setSearchQuery(query);
    setHasSearched(true);

    try {
      const filtersToUse = customFilters !== null ? customFilters : filters;
      const data = await api.search(query, filtersToUse);
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
    if (searchQuery.trim()) {
      handleSearch(searchQuery, newFilters);
    }
  };

  const handleUploadComplete = () => {
    loadFilters();
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  return (
    <div className="documents-page">
      <div className="documents-header">
        <div className="header-text">
          <h1>Document Collection</h1>
          <p>Search through our comprehensive archive of marketing materials</p>
        </div>
        <button 
          className="upload-button"
          onClick={() => setShowUploadModal(true)}
        >
          <Upload size={20} />
          Add Documents
        </button>
      </div>

      <div className="search-section">
        <SearchBar onSearch={handleSearch} />
      </div>

      {hasSearched && (
        <div className="results-section">
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

      {!hasSearched && (
        <div className="no-search-state">
          <div className="library-graphic">
            <div className="bookshelf">
              <div className="book book-1"></div>
              <div className="book book-2"></div>
              <div className="book book-3"></div>
              <div className="book book-4"></div>
              <div className="book book-5"></div>
            </div>
          </div>
          <h2>Begin Your Research</h2>
          <p>Enter a search term above to explore our document collection</p>
        </div>
      )}

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </div>
  );
}

export default Documents;

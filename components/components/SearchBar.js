import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, X, TrendingUp } from 'lucide-react';
import { searchHistory } from '../services/searchHistory';
import './SearchBar.css';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [history, setHistory] = useState([]);
  const [popularSearches] = useState([
    'brand guidelines', 'marketing', 'social media', 'email campaign', 'Q4 2024'
  ]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setHistory(searchHistory.getHistory());
    
    // Close suggestions when clicking outside
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      searchHistory.addToHistory(query);
      setHistory(searchHistory.getHistory());
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestionQuery) => {
    setQuery(suggestionQuery);
    searchHistory.addToHistory(suggestionQuery);
    setHistory(searchHistory.getHistory());
    onSearch(suggestionQuery);
    setShowSuggestions(false);
  };

  const handleRemoveHistory = (itemQuery, e) => {
    e.stopPropagation();
    searchHistory.removeItem(itemQuery);
    setHistory(searchHistory.getHistory());
  };

  const handleClearHistory = () => {
    searchHistory.clearHistory();
    setHistory([]);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (!showSuggestions) {
      setShowSuggestions(true);
    }
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  return (
    <div className="search-bar-container" ref={wrapperRef}>
      <form className="search-bar" onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Search documents, files, and assets..."
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
          />
          {query && (
            <button 
              type="button" 
              className="clear-search"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <button type="submit" className="search-button">
            Search
          </button>
        </div>
      </form>

      {showSuggestions && (history.length > 0 || popularSearches.length > 0) && (
        <div className="search-suggestions">
          {history.length > 0 && (
            <div className="suggestions-section">
              <div className="suggestions-header">
                <div className="suggestions-title">
                  <Clock size={14} />
                  <span>Recent Searches</span>
                </div>
                <button 
                  className="clear-history-btn"
                  onClick={handleClearHistory}
                >
                  Clear
                </button>
              </div>
              <div className="suggestions-list">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(item.query)}
                  >
                    <Clock size={14} />
                    <span className="suggestion-text">{item.query}</span>
                    <button
                      className="remove-history-btn"
                      onClick={(e) => handleRemoveHistory(item.query, e)}
                      aria-label="Remove from history"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {popularSearches.length > 0 && (
            <div className="suggestions-section">
              <div className="suggestions-header">
                <div className="suggestions-title">
                  <TrendingUp size={14} />
                  <span>Popular Searches</span>
                </div>
              </div>
              <div className="suggestions-list">
                {popularSearches.map((search, index) => (
                  <div
                    key={index}
                    className="suggestion-item popular"
                    onClick={() => handleSuggestionClick(search)}
                  >
                    <TrendingUp size={14} />
                    <span className="suggestion-text">{search}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;

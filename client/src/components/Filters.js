import React from 'react';
import { Filter, X } from 'lucide-react';
import './Filters.css';

function Filters({ filters, availableFilters, onChange }) {
  const handleFilterChange = (key, value) => {
    onChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onChange({
      extension: '',
      category: '',
      project: '',
      team: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="filters-panel">
      <div className="filters-header">
        <div className="filters-title">
          <Filter size={18} />
          <h3>Filters</h3>
        </div>
        {hasActiveFilters && (
          <button className="clear-filters" onClick={clearFilters}>
            <X size={16} />
            Clear all
          </button>
        )}
      </div>

      <div className="filter-group">
        <label>File Type</label>
        <select
          value={filters.extension}
          onChange={(e) => handleFilterChange('extension', e.target.value)}
        >
          <option value="">All types</option>
          {availableFilters.extensions.map(ext => (
            <option key={ext} value={ext}>{ext.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Category</label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">All categories</option>
          {availableFilters.categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Project</label>
        <select
          value={filters.project}
          onChange={(e) => handleFilterChange('project', e.target.value)}
        >
          <option value="">All projects</option>
          {availableFilters.projects.map(proj => (
            <option key={proj} value={proj}>{proj}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Team</label>
        <select
          value={filters.team}
          onChange={(e) => handleFilterChange('team', e.target.value)}
        >
          <option value="">All teams</option>
          {availableFilters.teams.map(team => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Date Range</label>
        <input
          type="date"
          placeholder="From"
          value={filters.dateFrom}
          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
        />
        <input
          type="date"
          placeholder="To"
          value={filters.dateTo}
          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
        />
      </div>
    </div>
  );
}

export default Filters;

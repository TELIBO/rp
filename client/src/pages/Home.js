import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Search, FileText, TrendingUp } from 'lucide-react';
import './Home.css';

function Home({ stats }) {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Marketing Knowledge Library</h1>
          <p className="hero-subtitle">A curated collection of marketing documents, campaigns, and resources</p>
          <button className="cta-button" onClick={() => navigate('/documents')}>
            <Search size={20} />
            Explore Collection
          </button>
        </div>
      </section>

      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon">
            <Book size={32} />
          </div>
          <h3>Comprehensive Archive</h3>
          <p>Access {stats?.totalDocuments || 0} carefully indexed documents spanning all marketing disciplines</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <FileText size={32} />
          </div>
          <h3>Smart Categorization</h3>
          <p>Documents automatically organized into {stats?.totalCategories || 0} distinct categories for easy discovery</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <TrendingUp size={32} />
          </div>
          <h3>Instant Search</h3>
          <p>Find what you need in seconds with our powerful full-text search engine</p>
        </div>
      </section>

      <section className="stats-section">
        <div className="stat-item">
          <div className="stat-number">{stats?.totalDocuments || 0}</div>
          <div className="stat-label">Documents</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-number">{stats?.totalCategories || 0}</div>
          <div className="stat-label">Categories</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-number">{stats?.totalProjects || 0}</div>
          <div className="stat-label">Projects</div>
        </div>
      </section>

      <section className="about-section">
        <h2>About This Collection</h2>
        <p>
          Our Marketing Knowledge Library is a comprehensive repository of institutional knowledge,
          best practices, and campaign materials. Each document has been carefully indexed and
          categorized to ensure you can quickly find the information you need.
        </p>
        <p>
          Whether you're researching past campaigns, seeking inspiration, or looking for brand
          guidelines, our collection serves as your primary resource for all marketing materials.
        </p>
      </section>
    </div>
  );
}

export default Home;

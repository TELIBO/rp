'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Book, Search, FileText, TrendingUp, Clock, Tag, FileType, BarChart3, PieChart, Activity, HardDrive } from 'lucide-react'
import '../components/pages/Home.css'
import '../components/App.css'
import '../components/index.css'

export default function Home() {
  const router = useRouter()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      setStats(data.stats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0)
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  return (
    <div className="App">
      <nav className="navigation">
        <div className="nav-content">
          <div className="nav-brand">
            <Book size={24} className="nav-logo" />
            <h1>Marketing Search</h1>
          </div>
          <div className="nav-links">
            <a href="/" className="nav-link active">Home</a>
            <a href="/documents" className="nav-link">Documents</a>
          </div>
        </div>
      </nav>

      <div className="home-page">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Marketing Knowledge Library</h1>
            <p className="hero-subtitle">A curated collection of marketing documents, campaigns, and resources</p>
            <button className="cta-button" onClick={() => router.push('/documents')}>
              <Search size={20} />
              Explore Documents
            </button>
          </div>
        </section>

        {stats && (
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FileText size={24} />
              </div>
              <div className="stat-content">
                <h3>{formatNumber(stats.totalDocuments)}</h3>
                <p>Total Documents</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FileType size={24} />
              </div>
              <div className="stat-content">
                <h3>{Object.keys(stats.fileTypes || {}).length}</h3>
                <p>File Types</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <HardDrive size={24} />
              </div>
              <div className="stat-content">
                <h3>{formatFileSize(stats.totalSize)}</h3>
                <p>Total Size</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

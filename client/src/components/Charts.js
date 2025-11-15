import React from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import './Charts.css';

const COLORS = ['#667eea', '#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c', '#34495e'];

// Category Distribution Bar Chart
export function CategoryChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-placeholder">No category data available</div>;
  }

  const chartData = data.map(cat => ({
    name: cat.name.length > 15 ? cat.name.substring(0, 15) + '...' : cat.name,
    count: cat.count,
    fullName: cat.name
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#7f8c8d', fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis tick={{ fill: '#7f8c8d', fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ 
            background: 'white', 
            border: '1px solid #ecf0f1',
            borderRadius: '8px',
            padding: '10px'
          }}
          labelFormatter={(value, payload) => {
            const item = chartData.find(d => d.name === value);
            return item ? item.fullName : value;
          }}
        />
        <Bar dataKey="count" fill="#667eea" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// File Type Distribution Pie Chart
export function FileTypeChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-placeholder">No file type data available</div>;
  }

  const chartData = data.map(ext => ({
    name: ext.extension.toUpperCase(),
    value: ext.count
  }));

  const renderLabel = (entry) => {
    return `${entry.name} (${entry.value})`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            background: 'white', 
            border: '1px solid #ecf0f1',
            borderRadius: '8px',
            padding: '10px'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Activity Timeline Chart (Document uploads over time)
export function ActivityChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-placeholder">No activity data available</div>;
  }

  // Group documents by date
  const activityMap = {};
  const today = new Date();
  
  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    activityMap[dateStr] = 0;
  }

  // Count documents per day
  data.forEach(doc => {
    const docDate = new Date(doc.modified);
    const dateStr = docDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (activityMap.hasOwnProperty(dateStr)) {
      activityMap[dateStr]++;
    }
  });

  const chartData = Object.keys(activityMap).map(date => ({
    date,
    count: activityMap[date]
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
        <XAxis 
          dataKey="date" 
          tick={{ fill: '#7f8c8d', fontSize: 12 }}
        />
        <YAxis tick={{ fill: '#7f8c8d', fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ 
            background: 'white', 
            border: '1px solid #ecf0f1',
            borderRadius: '8px',
            padding: '10px'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="count" 
          stroke="#667eea" 
          strokeWidth={3}
          dot={{ fill: '#667eea', r: 5 }}
          activeDot={{ r: 7 }}
          name="Documents"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Storage Usage Chart
export function StorageChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-placeholder">No storage data available</div>;
  }

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const chartData = data.map(ext => ({
    name: ext.extension.toUpperCase(),
    size: (ext.totalSize / 1024 / 1024).toFixed(2), // Convert to MB
    sizeFormatted: formatBytes(ext.totalSize)
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#7f8c8d', fontSize: 12 }}
        />
        <YAxis 
          tick={{ fill: '#7f8c8d', fontSize: 12 }}
          label={{ value: 'MB', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ 
            background: 'white', 
            border: '1px solid #ecf0f1',
            borderRadius: '8px',
            padding: '10px'
          }}
          formatter={(value, name, props) => [props.payload.sizeFormatted, 'Size']}
        />
        <Bar dataKey="size" fill="#2ecc71" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

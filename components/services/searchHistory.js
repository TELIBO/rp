// Search history service using localStorage
const MAX_HISTORY_ITEMS = 10;
const STORAGE_KEY = 'marketing_library_search_history';

export const searchHistory = {
  // Get all search history
  getHistory() {
    try {
      const history = localStorage.getItem(STORAGE_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error reading search history:', error);
      return [];
    }
  },

  // Add a search query to history
  addToHistory(query) {
    if (!query || query.trim().length < 2) return;
    
    try {
      let history = this.getHistory();
      
      // Remove if already exists (to move to top)
      history = history.filter(item => item.query.toLowerCase() !== query.toLowerCase());
      
      // Add to beginning with timestamp
      history.unshift({
        query: query.trim(),
        timestamp: new Date().toISOString()
      });
      
      // Keep only MAX_HISTORY_ITEMS
      history = history.slice(0, MAX_HISTORY_ITEMS);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  },

  // Clear all history
  clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  },

  // Remove a specific item
  removeItem(query) {
    try {
      let history = this.getHistory();
      history = history.filter(item => item.query !== query);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error removing history item:', error);
    }
  }
};

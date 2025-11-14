const natural = require('natural');
const path = require('path');

class DocumentCategorizer {
  constructor() {
    // Define category keywords
    this.categoryKeywords = {
      'Brand Strategy': ['brand', 'branding', 'identity', 'positioning', 'brand guide', 'style guide'],
      'Social Media': ['social', 'facebook', 'twitter', 'instagram', 'linkedin', 'post', 'hashtag', 'engagement'],
      'Content Marketing': ['blog', 'article', 'content', 'seo', 'editorial', 'copywriting'],
      'Email Marketing': ['email', 'newsletter', 'campaign', 'mailchimp', 'subscriber', 'drip'],
      'Analytics': ['analytics', 'metrics', 'kpi', 'data', 'report', 'dashboard', 'performance'],
      'Advertising': ['ad', 'advertising', 'ppc', 'campaign', 'google ads', 'facebook ads', 'banner'],
      'Product Launch': ['launch', 'product', 'release', 'announcement', 'rollout'],
      'Public Relations': ['pr', 'press', 'media', 'release', 'public relations', 'publicity'],
      'Design': ['design', 'graphic', 'visual', 'mockup', 'prototype', 'figma', 'photoshop'],
      'Video Marketing': ['video', 'youtube', 'vimeo', 'animation', 'multimedia'],
      'Market Research': ['research', 'survey', 'market', 'competitor', 'analysis', 'insights']
    };

    this.teamKeywords = {
      'Creative Team': ['design', 'creative', 'art', 'visual', 'graphic'],
      'Content Team': ['content', 'writing', 'editorial', 'blog', 'article'],
      'Social Media Team': ['social', 'community', 'engagement', 'post'],
      'Analytics Team': ['analytics', 'data', 'metrics', 'report', 'insights'],
      'Product Marketing': ['product', 'launch', 'feature', 'roadmap'],
      'Growth Team': ['growth', 'acquisition', 'conversion', 'funnel']
    };

    this.tokenizer = new natural.WordTokenizer();
  }

  categorize(content, filename, filePath) {
    const text = (content + ' ' + filename + ' ' + filePath).toLowerCase();
    const tokens = this.tokenizer.tokenize(text);

    return {
      topics: this.categorizeByTopic(tokens),
      team: this.categorizeByTeam(tokens),
      project: this.extractProject(filePath)
    };
  }

  categorizeByTopic(tokens) {
    const categories = [];
    const tokenSet = new Set(tokens);

    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      const matchCount = keywords.filter(keyword => {
        return tokens.some(token => token.includes(keyword) || keyword.includes(token));
      }).length;

      if (matchCount > 0) {
        categories.push({
          name: category,
          score: matchCount
        });
      }
    }

    // Sort by score and return top 3
    return categories
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(c => c.name);
  }

  categorizeByTeam(tokens) {
    let maxScore = 0;
    let bestTeam = 'General';

    for (const [team, keywords] of Object.entries(this.teamKeywords)) {
      const matchCount = keywords.filter(keyword => {
        return tokens.some(token => token.includes(keyword) || keyword.includes(token));
      }).length;

      if (matchCount > maxScore) {
        maxScore = matchCount;
        bestTeam = team;
      }
    }

    return bestTeam;
  }

  extractProject(filePath) {
    // Try to extract project name from directory structure
    const parts = filePath.split(path.sep);
    
    // Look for common project indicators
    const projectIndicators = ['project', 'campaign', 'client'];
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i].toLowerCase();
      
      if (projectIndicators.some(indicator => part.includes(indicator))) {
        return parts[i + 1] || parts[i];
      }
    }

    // If no project indicator found, use first directory level
    return parts.length > 1 ? parts[0] : 'Uncategorized';
  }
}

module.exports = DocumentCategorizer;

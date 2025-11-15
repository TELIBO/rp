const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

// Define marketing categories with their associated keywords
const categories = {
  'Brand & Identity': [
    'brand', 'identity', 'logo', 'visual', 'style', 'guide', 'guidelines',
    'colors', 'typography', 'design', 'asset', 'trademark', 'voice', 'tone',
    'personality', 'positioning', 'values', 'mission', 'vision'
  ],
  'Email Marketing': [
    'email', 'newsletter', 'campaign', 'subject', 'line', 'recipient',
    'unsubscribe', 'open', 'rate', 'click', 'through', 'mailchimp',
    'send', 'blast', 'automation', 'drip', 'sequence', 'personalization'
  ],
  'Social Media': [
    'social', 'media', 'facebook', 'twitter', 'instagram', 'linkedin',
    'post', 'hashtag', 'engagement', 'followers', 'influencer', 'tiktok',
    'youtube', 'pinterest', 'stories', 'reels', 'viral', 'share'
  ],
  'Content Strategy': [
    'content', 'blog', 'article', 'seo', 'keyword', 'editorial', 'calendar',
    'publish', 'writing', 'copywriting', 'storytelling', 'narrative',
    'thought', 'leadership', 'whitepaper', 'ebook', 'pillar'
  ],
  'Advertising': [
    'ad', 'advertising', 'ppc', 'paid', 'google', 'ads', 'facebook',
    'display', 'banner', 'retargeting', 'remarketing', 'cpm', 'cpc',
    'impression', 'conversion', 'landing', 'page', 'creative'
  ],
  'Analytics & Reporting': [
    'analytics', 'metrics', 'kpi', 'performance', 'report', 'dashboard',
    'tracking', 'measurement', 'roi', 'attribution', 'funnel', 'conversion',
    'rate', 'benchmark', 'goal', 'data', 'insight', 'statistics'
  ],
  'Product Marketing': [
    'product', 'launch', 'feature', 'release', 'roadmap', 'positioning',
    'messaging', 'pricing', 'competitive', 'analysis', 'market', 'research',
    'buyer', 'persona', 'value', 'proposition', 'differentiation'
  ],
  'Events & Webinars': [
    'event', 'webinar', 'conference', 'trade', 'show', 'booth', 'sponsor',
    'speaker', 'registration', 'attendee', 'virtual', 'hybrid', 'networking',
    'expo', 'summit', 'workshop', 'presentation', 'demo'
  ],
  'Customer Marketing': [
    'customer', 'retention', 'loyalty', 'advocacy', 'testimonial', 'review',
    'case', 'study', 'reference', 'upsell', 'cross-sell', 'churn',
    'satisfaction', 'nps', 'feedback', 'community'
  ],
  'Demand Generation': [
    'demand', 'generation', 'lead', 'nurture', 'qualification', 'scoring',
    'mql', 'sql', 'pipeline', 'prospecting', 'outreach', 'cadence',
    'touchpoint', 'engagement', 'conversion', 'funnel'
  ],
  'Partner Marketing': [
    'partner', 'channel', 'reseller', 'affiliate', 'co-marketing',
    'joint', 'collaboration', 'alliance', 'integration', 'ecosystem',
    'referral', 'program', 'enablement'
  ],
  'Internal': [
    'intern', 'internship', 'assignment', 'admit', 'admission', 'implementation',
    'hr', 'human', 'resources', 'admin', 'administrative', 'memo', 'memorandum',
    'policy', 'procedure', 'onboarding', 'training', 'internal', 'employee',
    'staff', 'team', 'meeting', 'notes', 'agenda', 'minutes'
  ],
  'Sales Enablement': [
    'sales', 'enablement', 'deck', 'pitch', 'proposal', 'quote', 'playbook',
    'battlecard', 'objection', 'handling', 'closing', 'negotiation',
    'qualification', 'discovery', 'demo', 'presentation'
  ],
  'Customer Success': [
    'customer', 'success', 'onboarding', 'adoption', 'health', 'score',
    'renewal', 'expansion', 'account', 'management', 'support',
    'implementation', 'training', 'documentation', 'best', 'practices'
  ],
  'Public Relations': [
    'pr', 'public', 'relations', 'press', 'release', 'media', 'coverage',
    'journalist', 'publication', 'announcement', 'statement', 'crisis',
    'communication', 'spokesperson', 'interview', 'news'
  ]
};

// Helper function to extract meaningful project identifiers from text
function extractProjectInfo(text) {
  const projects = [];
  
  // Look for common project patterns
  const patterns = [
    /\bQ[1-4][-\s]?\d{4}\b/gi,           // Q4-2024, Q1 2024
    /\b\d{4}[-\s]?Q[1-4]\b/gi,           // 2024-Q4, 2024 Q1
    /\b[A-Z]{3,}[-]\d{2,4}\b/gi,         // PROJ-2024, ABC-24 (minimum 3 letters, must have hyphen)
    /\bcampaign[-\s]\w+/gi,              // campaign-holiday
    /\b(spring|summer|fall|winter|holiday)[-\s]?\d{4}\b/gi  // holiday-2024
  ];
  
  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      projects.push(...matches.map(m => m.trim()));
    }
  });
  
  return [...new Set(projects)]; // Remove duplicates
}

// Categorize document based on content and filename
function categorizeDocument(content, filename = '') {
  const text = `${content} ${filename}`.toLowerCase();
  const tokens = tokenizer.tokenize(text);
  
  if (!tokens || tokens.length === 0) {
    return {
      category: 'General',
      confidence: 0,
      projects: extractProjectInfo(filename)
    };
  }

  const scores = {};
  
  // Check for minimal content (likely PDF with no extracted text)
  const hasMinimalContent = tokens.length < 50;
  
  // Score each category
  Object.entries(categories).forEach(([category, keywords]) => {
    let score = 0;
    
    keywords.forEach(keyword => {
      const keywordTokens = keyword.toLowerCase().split(' ');
      
      // Count occurrences in content
      if (keywordTokens.length === 1) {
        score += tokens.filter(t => t === keyword).length;
      } else {
        // Multi-word keyword matching
        const keywordText = keywordTokens.join(' ');
        const matchCount = (text.match(new RegExp(keywordText, 'gi')) || []).length;
        score += matchCount * 2; // Weight multi-word matches higher
      }
      
      // For minimal content (PDFs), heavily weight filename matches
      if (hasMinimalContent) {
        const filenameText = filename.toLowerCase();
        if (keywordTokens.length === 1) {
          if (filenameText.includes(keyword)) {
            score += 3; // Triple weight for filename matches on minimal content
          }
        } else {
          const keywordText = keywordTokens.join(' ');
          if (filenameText.includes(keywordText)) {
            score += 6; // Even higher weight for multi-word filename matches
          }
        }
      }
    });
    
    scores[category] = score;
  });

  // Find the category with the highest score
  const sortedCategories = Object.entries(scores)
    .sort(([, a], [, b]) => b - a);
  
  const topCategory = sortedCategories[0];
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  
  // Calculate confidence (0-1)
  const confidence = totalScore > 0 ? topCategory[1] / totalScore : 0;
  
  // Extract project information
  const projects = extractProjectInfo(`${content} ${filename}`);

  return {
    category: topCategory[1] > 0 ? topCategory[0] : 'General',
    confidence: Math.round(confidence * 100) / 100,
    projects: projects,
    scores: sortedCategories.slice(0, 3).map(([cat, score]) => ({ category: cat, score }))
  };
}

module.exports = {
  categorizeDocument,
  categories: Object.keys(categories)
};

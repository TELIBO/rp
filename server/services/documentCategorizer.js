const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const TfIdf = natural.TfIdf;
const BayesClassifier = natural.BayesClassifier;

// Common stopwords to filter out
const stopwords = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with',
  'this', 'but', 'they', 'have', 'had', 'what', 'when', 'where', 'who', 'which',
  'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 'can', 'will', 'just', 'should', 'now'
]);

// TF-IDF instance for document corpus
const tfidf = new TfIdf();

// Bayes classifier for machine learning categorization
const classifier = new BayesClassifier();

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

// Helper function to preprocess and tokenize text
function preprocessText(text) {
  const tokens = tokenizer.tokenize(text.toLowerCase());
  if (!tokens) return [];
  
  // Filter stopwords and stem
  return tokens
    .filter(token => token.length > 2 && !stopwords.has(token))
    .map(token => stemmer.stem(token));
}

// Helper function to extract meaningful project identifiers from text
function extractProjectInfo(text) {
  const projects = [];
  
  // Enhanced project patterns with more variations
  const patterns = [
    // Quarterly identifiers
    /\bQ[1-4][-\s]?\d{4}\b/gi,                          // Q4-2024, Q1 2024
    /\b\d{4}[-\s]?Q[1-4]\b/gi,                          // 2024-Q4, 2024 Q1
    /\b(quarter|qtr)[-\s]?[1-4][-\s]?\d{4}\b/gi,       // Quarter-1-2024, Qtr 4 2024
    
    // Fiscal year identifiers
    /\b(FY|H[12]|CY)\d{2,4}\b/gi,                       // FY2024, H1-2024, CY24
    /\bfiscal[-\s]?(year|yr)[-\s]?\d{2,4}\b/gi,        // Fiscal Year 2024
    
    // Project codes and identifiers
    /\b[A-Z]{3,}[-]\d{2,4}\b/gi,                        // PROJ-2024, ABC-24
    /\b[A-Z]{2,}[-_][A-Z]{2,}[-_]\d{2,4}\b/gi,         // TEAM-PROJ-2024
    /\bproject[-\s][a-zA-Z0-9]+\b/gi,                   // project-alpha, project 123
    /\b[A-Z]{2,}\d{3,}\b/gi,                            // MKT2024, PROJ001
    
    // Campaign identifiers
    /\bcampaign[-\s]\w+/gi,                             // campaign-holiday
    /\b(spring|summer|fall|winter|holiday|christmas|new[-\s]?year|black[-\s]?friday)[-\s]?\d{2,4}\b/gi, // holiday-2024
    /\b\w+[-\s]campaign[-\s]?\d{0,4}\b/gi,             // email-campaign, social-campaign-2024
    
    // Initiative and program identifiers
    /\binitiative[-\s]\w+/gi,                           // initiative-growth
    /\bprogram[-\s]\w+/gi,                              // program-retention
    /\b(launch|rollout|release)[-\s]\w+/gi,            // launch-mobile, release-v2
    
    // Phase and milestone identifiers
    /\bphase[-\s]?\d+/gi,                               // phase-1, phase 2
    /\bmilestone[-\s]?\d+/gi,                           // milestone-3
    /\b(sprint|iteration)[-\s]?\d+/gi,                 // sprint-5, iteration 3
    
    // Version identifiers
    /\bv\d+\.\d+(\.\d+)?/gi,                           // v1.0, v2.5.1
    /\bversion[-\s]?\d+(\.\d+)?/gi,                    // version-2, version 3.0
    
    // Month-year combinations
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[-\s]?\d{4}\b/gi, // Jan-2024, December 2024
    
    // Code names and special identifiers
    /\b(alpha|beta|gamma|delta|omega)[-\s]?(phase|release|version)?\b/gi, // alpha-phase, beta release
  ];
  
  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      projects.push(...matches.map(m => m.trim()));
    }
  });
  
  // Remove duplicates and clean up
  const uniqueProjects = [...new Set(projects)];
  
  // Sort by relevance (longer strings first, as they're usually more specific)
  return uniqueProjects.sort((a, b) => b.length - a.length).slice(0, 5); // Return top 5 most specific
}

// Helper function to extract team/department information from text
function extractTeamInfo(text) {
  const lowerText = text.toLowerCase();
  
  // Common department/team names
  const teamPatterns = {
    'Marketing': /\b(marketing|mkt|mrkt)\s*(team|dept|department)?\b/gi,
    'Sales': /\b(sales|revenue)\s*(team|dept|department)?\b/gi,
    'Engineering': /\b(engineering|eng|development|dev)\s*(team|dept|department)?\b/gi,
    'Product': /\b(product|prod)\s*(team|dept|department|management)?\b/gi,
    'Design': /\b(design|creative|ux|ui)\s*(team|dept|department)?\b/gi,
    'HR': /\b(hr|human\s*resources|people\s*ops|talent)\s*(team|dept|department)?\b/gi,
    'Finance': /\b(finance|accounting|financial)\s*(team|dept|department)?\b/gi,
    'Operations': /\b(operations|ops)\s*(team|dept|department)?\b/gi,
    'Customer Success': /\b(customer\s*success|cs|support)\s*(team|dept|department)?\b/gi,
    'Legal': /\b(legal|compliance)\s*(team|dept|department)?\b/gi,
    'Executive': /\b(executive|leadership|c-level|management)\s*(team)?\b/gi,
    'Analytics': /\b(analytics|data|business\s*intelligence)\s*(team|dept|department)?\b/gi
  };
  
  // Check for explicit team patterns first
  for (const [team, pattern] of Object.entries(teamPatterns)) {
    if (pattern.test(lowerText)) {
      return team;
    }
  }
  
  // Check for team identifiers like "Team A", "Alpha Team", "Squad 1"
  const teamIdPatterns = [
    /\bteam[-\s]?[a-z0-9]+\b/gi,
    /\b(alpha|beta|gamma|delta|squad|group)[-\s]?(team|[0-9]+)\b/gi
  ];
  
  for (const pattern of teamIdPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  
  return null;
}

// Helper function to detect phrases in text
function findPhrases(text, phrases) {
  const found = [];
  const lowerText = text.toLowerCase();
  
  phrases.forEach(phrase => {
    const regex = new RegExp(`\\b${phrase.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      found.push({ phrase, count: matches.length });
    }
  });
  
  return found;
}

// Categorize document based on content and filename
function categorizeDocument(content, filename = '') {
  const fullText = `${content} ${filename}`;
  const text = fullText.toLowerCase();
  
  // Preprocess: tokenize, remove stopwords, stem
  const tokens = preprocessText(fullText);
  
  if (tokens.length === 0) {
    return {
      category: 'General',
      confidence: 0,
      projects: extractProjectInfo(filename),
      keywords: []
    };
  }

  // Add document to TF-IDF corpus
  tfidf.addDocument(tokens.join(' '));

  const scores = {};
  const hasMinimalContent = tokens.length < 30; // Adjusted for stemmed tokens
  
  // Machine learning classification using Bayes
  let mlCategory = null;
  let mlConfidence = 0;
  try {
    const processedText = tokens.join(' ');
    const classifications = classifier.getClassifications(processedText);
    if (classifications && classifications.length > 0) {
      mlCategory = classifications[0].label;
      mlConfidence = classifications[0].value;
    }
  } catch (e) {
    // Classifier not trained yet
  }
  
  // Define important multi-word phrases for each category
  const categoryPhrases = {
    'Brand & Identity': ['brand identity', 'style guide', 'brand guidelines', 'visual identity'],
    'Email Marketing': ['email campaign', 'email marketing', 'open rate', 'click through'],
    'Social Media': ['social media', 'social post', 'instagram post', 'facebook ad'],
    'Content Strategy': ['content strategy', 'content calendar', 'editorial calendar', 'seo strategy'],
    'Advertising': ['paid advertising', 'google ads', 'facebook ads', 'display ad'],
    'Analytics & Reporting': ['analytics report', 'performance metrics', 'conversion rate', 'roi analysis'],
    'Product Marketing': ['product launch', 'product marketing', 'go to market', 'buyer persona'],
    'Events & Webinars': ['event planning', 'webinar series', 'trade show', 'conference booth'],
    'Customer Marketing': ['customer success', 'case study', 'customer testimonial', 'user review'],
    'Demand Generation': ['demand generation', 'lead generation', 'lead nurture', 'marketing qualified'],
    'Partner Marketing': ['partner marketing', 'channel partner', 'partner program', 'co marketing'],
    'Internal': ['internal memo', 'staff meeting', 'employee onboarding', 'internal policy'],
    'Sales Enablement': ['sales enablement', 'sales deck', 'pitch deck', 'sales playbook'],
    'Customer Success': ['customer success', 'customer onboarding', 'account management', 'success plan'],
    'Public Relations': ['press release', 'media coverage', 'public relations', 'media kit']
  };
  
  // Score each category
  Object.entries(categories).forEach(([category, keywords]) => {
    let score = 0;
    
    // Phrase matching (highest weight)
    if (categoryPhrases[category]) {
      const phrasesFound = findPhrases(text, categoryPhrases[category]);
      phrasesFound.forEach(({ phrase, count }) => {
        score += count * 5; // High weight for phrase matches
      });
    }
    
    // Keyword matching with stemming
    keywords.forEach(keyword => {
      const stemmedKeyword = stemmer.stem(keyword.toLowerCase());
      const matchCount = tokens.filter(t => t === stemmedKeyword).length;
      score += matchCount;
      
      // Filename bonus for minimal content
      if (hasMinimalContent && filename.toLowerCase().includes(keyword)) {
        score += 4;
      }
    });
    
    scores[category] = score;
  });

  // Normalize scores to 0-1 range
  const maxScore = Math.max(...Object.values(scores), 1);
  const normalizedScores = {};
  Object.entries(scores).forEach(([category, score]) => {
    normalizedScores[category] = score / maxScore;
  });
  
  // Blend ML prediction with rule-based scores if ML is confident
  if (mlCategory && mlConfidence > 0.6 && normalizedScores[mlCategory]) {
    normalizedScores[mlCategory] = Math.min(1, normalizedScores[mlCategory] * 1.5);
  }

  // Find the category with the highest score
  const sortedCategories = Object.entries(normalizedScores)
    .sort(([, a], [, b]) => b - a);
  
  const topCategory = sortedCategories[0];
  
  // Extract top TF-IDF keywords
  const docIndex = tfidf.documents.length - 1;
  const topKeywords = [];
  tfidf.listTerms(docIndex).slice(0, 10).forEach(item => {
    topKeywords.push(item.term);
  });
  
  // Train classifier with the result (online learning)
  if (topCategory[1] > 0.3) {
    try {
      classifier.addDocument(tokens.join(' '), topCategory[0]);
      classifier.train();
    } catch (e) {
      // Training error
    }
  }

  return {
    category: topCategory[1] > 0.1 ? topCategory[0] : 'General', // Threshold for confidence
    confidence: Math.round(topCategory[1] * 100) / 100,
    projects: extractProjectInfo(fullText),
    team: extractTeamInfo(fullText),
    keywords: topKeywords,
    mlPrediction: mlCategory && mlConfidence > 0.5 ? { category: mlCategory, confidence: Math.round(mlConfidence * 100) / 100 } : null,
    scores: sortedCategories.slice(0, 3).map(([cat, score]) => ({ 
      category: cat, 
      score: Math.round(score * 100) / 100 
    }))
  };
}

module.exports = {
  categorizeDocument,
  categories: Object.keys(categories)
};

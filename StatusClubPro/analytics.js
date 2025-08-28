
// StatusClub Pro - Advanced Revenue Analytics System
// Tracks user behavior, conversion events, and revenue potential

class StatusClubAnalytics {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.userId = this.getOrCreateUserId();
    this.startTime = Date.now();
    this.events = [];
    this.revenue = {
      totalPotential: 0,
      affiliateClicks: 0,
      premiumInterest: 0,
      subscriptions: 0,
      conversionScore: 0
    };
    this.userProfile = {
      engagementLevel: 'cold', // cold, warm, hot
      interests: [],
      priceRange: null,
      sessionDuration: 0,
      pageViews: 1,
      scrollDepth: 0
    };
    
    this.init();
  }

  init() {
    this.setupScrollTracking();
    this.setupTimeTracking();
    this.setupClickTracking();
    this.setupFormTracking();
    this.startAutoSave();
    
    console.log('📊 StatusClub Analytics initialized:', {
      sessionId: this.sessionId,
      userId: this.userId
    });
  }

  getOrCreateSessionId() {
    let sid = sessionStorage.getItem('sc_session');
    if (!sid) {
      sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('sc_session', sid);
    }
    return sid;
  }

  getOrCreateUserId() {
    let uid = localStorage.getItem('sc_user_id');
    if (!uid) {
      uid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sc_user_id', uid);
    }
    return uid;
  }

  track(eventName, data = {}) {
    const event = {
      event: eventName,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      data: {
        ...data,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`
      }
    };

    this.events.push(event);
    this.updateUserProfile(eventName, data);
    this.updateRevenueMetrics(eventName, data);
    
    console.log('📈 Event tracked:', event);
    return event;
  }

  updateUserProfile(eventName, data) {
    const now = Date.now();
    this.userProfile.sessionDuration = now - this.startTime;

    // Update engagement level based on activity
    if (eventName === 'scroll_depth' && data.percentage > 50) {
      this.userProfile.engagementLevel = 'warm';
    }
    if (this.userProfile.sessionDuration > 120000) { // 2 minutes
      this.userProfile.engagementLevel = 'hot';
    }
    if (eventName === 'affiliate_click' || eventName === 'premium_interest') {
      this.userProfile.engagementLevel = 'hot';
    }

    // Track interests
    if (data.category && !this.userProfile.interests.includes(data.category)) {
      this.userProfile.interests.push(data.category);
    }

    // Track price preferences
    if (data.estimatedValue) {
      if (!this.userProfile.priceRange) {
        this.userProfile.priceRange = { min: data.estimatedValue, max: data.estimatedValue };
      } else {
        this.userProfile.priceRange.min = Math.min(this.userProfile.priceRange.min, data.estimatedValue);
        this.userProfile.priceRange.max = Math.max(this.userProfile.priceRange.max, data.estimatedValue);
      }
    }
  }

  updateRevenueMetrics(eventName, data) {
    switch (eventName) {
      case 'affiliate_click':
        this.revenue.affiliateClicks++;
        this.revenue.totalPotential += (data.estimatedValue || 50);
        this.revenue.conversionScore += 15;
        break;
      
      case 'premium_interest':
        this.revenue.premiumInterest++;
        this.revenue.totalPotential += (data.planValue || 39);
        this.revenue.conversionScore += 25;
        break;
      
      case 'subscribe':
        this.revenue.subscriptions++;
        this.revenue.totalPotential += (data.value || 39);
        this.revenue.conversionScore += 100;
        break;
      
      case 'lead':
        this.revenue.conversionScore += 10;
        break;
      
      case 'scroll_depth':
        if (data.percentage > 75) {
          this.revenue.conversionScore += 5;
        }
        break;
    }

    // Cap conversion score at 100
    this.revenue.conversionScore = Math.min(this.revenue.conversionScore, 100);
  }

  setupScrollTracking() {
    let maxScroll = 0;
    let ticking = false;

    const updateScrollDepth = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = Math.round((scrollTop / (docHeight - winHeight)) * 100);

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        this.userProfile.scrollDepth = maxScroll;

        // Track milestone scroll depths
        if ([25, 50, 75, 90].includes(maxScroll)) {
          this.track('scroll_depth', { percentage: maxScroll });
        }
      }
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDepth);
        ticking = true;
      }
    });
  }

  setupTimeTracking() {
    // Track time milestones
    const milestones = [30000, 60000, 120000, 300000]; // 30s, 1m, 2m, 5m
    
    milestones.forEach(milestone => {
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          this.track('time_on_site', { 
            duration: milestone,
            engagementLevel: this.userProfile.engagementLevel 
          });
        }
      }, milestone);
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.track('visibility_change', { 
        hidden: document.hidden,
        duration: Date.now() - this.startTime 
      });
    });
  }

  setupClickTracking() {
    document.addEventListener('click', (e) => {
      const element = e.target.closest('[data-track]');
      if (element) {
        const trackingData = {
          elementType: element.tagName.toLowerCase(),
          trackingId: element.dataset.track,
          elementId: element.dataset.id,
          category: element.dataset.category,
          estimatedValue: parseFloat(element.dataset.value) || 0,
          position: {
            x: e.clientX,
            y: e.clientY
          },
          elementPosition: element.getBoundingClientRect()
        };

        this.track(element.dataset.track, trackingData);
      }

      // Track generic clicks on important elements
      if (e.target.matches('a[href^="http"]')) {
        this.track('external_link_click', {
          url: e.target.href,
          text: e.target.textContent.trim()
        });
      }
    });
  }

  setupFormTracking() {
    // Track form interactions
    document.addEventListener('focus', (e) => {
      if (e.target.matches('input, textarea, select')) {
        this.track('form_field_focus', {
          fieldName: e.target.name || e.target.id,
          fieldType: e.target.type,
          formId: e.target.closest('form')?.id
        });
      }
    }, true);

    document.addEventListener('submit', (e) => {
      if (e.target.matches('form')) {
        const formData = new FormData(e.target);
        const fields = {};
        for (let [key, value] of formData.entries()) {
          fields[key] = value.length; // Track field length, not actual content
        }

        this.track('form_submit', {
          formId: e.target.id,
          fieldCount: Object.keys(fields).length,
          fields: fields
        });
      }
    });
  }

  startAutoSave() {
    // Save analytics data every 30 seconds
    setInterval(() => {
      this.saveToLocalStorage();
      this.sendToServer();
    }, 30000);

    // Save on page unload
    window.addEventListener('beforeunload', () => {
      this.saveToLocalStorage();
      this.sendToServer();
    });
  }

  saveToLocalStorage() {
    const analyticsData = {
      events: this.events,
      revenue: this.revenue,
      userProfile: this.userProfile,
      sessionId: this.sessionId,
      userId: this.userId,
      lastUpdate: Date.now()
    };

    localStorage.setItem('sc_analytics', JSON.stringify(analyticsData));
  }

  sendToServer() {
    // In production, send to your analytics endpoint
    if (this.events.length > 0) {
      console.log('📊 Sending analytics to server:', {
        events: this.events.length,
        revenue: this.revenue,
        userProfile: this.userProfile
      });

      // Example API call:
      /*
      fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          userId: this.userId,
          events: this.events,
          revenue: this.revenue,
          userProfile: this.userProfile
        })
      }).catch(console.error);
      */

      // Clear events after sending
      this.events = [];
    }
  }

  // Public methods for manual tracking
  trackPurchase(productId, value, category) {
    this.track('purchase', {
      productId,
      value,
      category,
      conversionType: 'direct'
    });
  }

  trackPageView(page = window.location.pathname) {
    this.userProfile.pageViews++;
    this.track('page_view', {
      page,
      pageViews: this.userProfile.pageViews
    });
  }

  trackCustomEvent(eventName, data) {
    this.track(eventName, data);
  }

  // Get analytics summary
  getAnalyticsSummary() {
    return {
      session: {
        id: this.sessionId,
        duration: Date.now() - this.startTime,
        events: this.events.length
      },
      revenue: this.revenue,
      userProfile: this.userProfile,
      conversionProbability: this.calculateConversionProbability()
    };
  }

  calculateConversionProbability() {
    let probability = 0;
    
    // Base on engagement level
    switch (this.userProfile.engagementLevel) {
      case 'hot': probability += 40; break;
      case 'warm': probability += 20; break;
      case 'cold': probability += 5; break;
    }

    // Add based on actions
    probability += this.revenue.affiliateClicks * 10;
    probability += this.revenue.premiumInterest * 15;
    probability += (this.userProfile.sessionDuration / 60000) * 2; // 2% per minute

    return Math.min(probability, 100);
  }
}

// Initialize analytics
const analytics = new StatusClubAnalytics();

// Export for global use
window.scAnalytics = analytics;
window.track = (eventName, data) => analytics.track(eventName, data);

// Track initial page load
analytics.trackPageView();

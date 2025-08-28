
// StatusClub Pro - Advanced Conversion Rate Optimization System
// Implements personalized experiences based on user behavior

class ConversionOptimizer {
  constructor() {
    this.userScore = 0;
    this.sessionStartTime = Date.now();
    this.exitIntentShown = false;
    this.vipOfferShown = false;
    this.socialProofInterval = null;
    this.urgencyTimers = new Map();
    this.personalizedOffers = new Map();
    
    this.init();
  }

  init() {
    this.setupBehaviorTracking();
    this.setupExitIntent();
    this.setupPersonalization();
    this.startSocialProofRotation();
    this.setupDynamicPricing();
    
    console.log('🎯 Conversion Optimizer initialized');
  }

  setupBehaviorTracking() {
    // Track engagement signals
    let scrollDepth = 0;
    let timeOnSite = 0;
    let clickCount = 0;

    // Scroll tracking
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > scrollDepth) {
        scrollDepth = scrollPercent;
        this.updateUserScore('scroll', scrollPercent);
      }
    });

    // Time tracking
    setInterval(() => {
      timeOnSite += 1000;
      this.updateUserScore('time', timeOnSite);
    }, 1000);

    // Click tracking
    document.addEventListener('click', (e) => {
      clickCount++;
      this.updateUserScore('click', clickCount);
      
      // Track specific high-value actions
      if (e.target.closest('[data-track="affiliate_click"]')) {
        this.updateUserScore('affiliate_interest', 20);
      }
      if (e.target.closest('[data-track="premium_interest"]')) {
        this.updateUserScore('premium_interest', 25);
      }
    });

    // Form engagement
    document.addEventListener('focus', (e) => {
      if (e.target.matches('input, textarea')) {
        this.updateUserScore('form_engagement', 15);
      }
    }, true);
  }

  updateUserScore(action, value) {
    const scoreMap = {
      scroll: Math.min(value / 4, 25), // Max 25 points for full scroll
      time: Math.min(value / 6000, 30), // Max 30 points for 3 minutes
      click: Math.min(value * 2, 20), // Max 20 points for clicks
      affiliate_interest: 20,
      premium_interest: 25,
      form_engagement: 15
    };

    const points = scoreMap[action] || 0;
    this.userScore = Math.min(this.userScore + points, 100);
    
    // Trigger personalized experiences based on score
    this.triggerPersonalizedExperience();
    
    // Track the score update
    if (window.track) {
      window.track('user_score_update', {
        action,
        value,
        points,
        totalScore: this.userScore
      });
    }
  }

  triggerPersonalizedExperience() {
    const score = this.userScore;
    
    if (score >= 70 && !this.vipOfferShown) {
      this.showVipOffer();
    } else if (score >= 40 && score < 70) {
      this.enhanceCurrentExperience();
    } else if (score >= 20 && score < 40) {
      this.showSoftEncouragement();
    }
  }

  showVipOffer() {
    if (this.vipOfferShown) return;
    this.vipOfferShown = true;

    const modal = document.createElement('div');
    modal.className = 'modal open';
    modal.style.zIndex = '90';
    modal.innerHTML = `
      <div class="box" style="max-width: 500px; text-align: center; position: relative;">
        <button onclick="this.closest('.modal').remove()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; color: var(--text); cursor: pointer;">×</button>
        
        <div style="font-size: 3rem; margin-bottom: 1rem;">🎖️</div>
        <h2 style="color: var(--brand); margin: 0 0 1rem;">¡Oferta VIP Exclusiva!</h2>
        <p style="color: var(--muted); margin-bottom: 1.5rem;">
          Basado en tu alto interés, te ofrecemos acceso Elite con <strong style="color: var(--brand);">40% de descuento</strong>
        </p>
        
        <div style="background: linear-gradient(135deg, var(--brand), var(--brand-2)); padding: 1.5rem; border-radius: 12px; margin: 1rem 0; color: #231a0a;">
          <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">StatusClub Elite</div>
          <div style="display: flex; align-items: center; justify-content: center; gap: 1rem;">
            <span style="text-decoration: line-through; opacity: 0.7; font-size: 1.1rem;">$39/mes</span>
            <span style="font-size: 2rem; font-weight: 800;">$23/mes</span>
          </div>
          <div style="font-size: 0.9rem; margin-top: 0.5rem;">Solo los próximos 15 minutos</div>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button onclick="this.closest('.modal').remove()" class="btn">Quizás después</button>
          <button onclick="conversionOptimizer.handleVipUpgrade()" class="btn primary" style="flex: 1;">¡Quiero Elite VIP!</button>
        </div>
        
        <div style="margin-top: 1rem; font-size: 0.85rem; color: var(--muted);">
          ✅ Garantía 30 días • 🔄 Cancela cuando quieras
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Auto-close after 5 minutes
    setTimeout(() => {
      if (modal.parentNode) modal.remove();
    }, 300000);

    if (window.track) {
      window.track('vip_offer_shown', { userScore: this.userScore });
    }
  }

  enhanceCurrentExperience() {
    // Add dynamic badges to products
    const productCards = document.querySelectorAll('.item');
    productCards.forEach((card, index) => {
      if (index < 3 && !card.querySelector('.hot-badge')) {
        const badge = document.createElement('div');
        badge.className = 'hot-badge';
        badge.style.cssText = `
          position: absolute; top: 0.5rem; right: 0.5rem; z-index: 5;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white; padding: 0.25rem 0.5rem; border-radius: 6px;
          font-size: 0.75rem; font-weight: 800; text-transform: uppercase;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
          animation: pulse 2s infinite;
        `;
        badge.textContent = '🔥 HOT';
        card.style.position = 'relative';
        card.appendChild(badge);
      }
    });

    // Show live activity indicator
    this.showLiveActivity();
  }

  showSoftEncouragement() {
    // Add subtle animations to CTAs
    const ctaButtons = document.querySelectorAll('.btn.primary');
    ctaButtons.forEach(btn => {
      if (!btn.style.animation) {
        btn.style.animation = 'pulse 3s infinite';
      }
    });
  }

  setupExitIntent() {
    let exitIntentTriggered = false;
    
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0 && !exitIntentTriggered && !this.exitIntentShown) {
        exitIntentTriggered = true;
        this.exitIntentShown = true;
        this.showExitIntentOffer();
      }
    });
  }

  showExitIntentOffer() {
    const modal = document.createElement('div');
    modal.className = 'modal open';
    modal.style.zIndex = '85';
    modal.innerHTML = `
      <div class="box" style="max-width: 600px; text-align: center;">
        <h2 style="margin-top: 0; color: var(--brand);">✋ ¡Espera! No te vayas con las manos vacías</h2>
        <p style="color: var(--muted); font-size: 1.1rem; margin-bottom: 2rem;">
          Descarga gratis nuestro <strong>"Reporte de Inversiones en Status 2025"</strong> 
          <br>Valorado en <span style="color: var(--brand); font-weight: 800;">$197 USD</span>
        </p>

        <div style="background: var(--panel); border: 1px solid var(--brand); border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0;">
          <h3 style="margin-top: 0; color: var(--brand);">🎁 Incluye:</h3>
          <ul style="text-align: left; color: var(--muted); line-height: 1.6; margin: 0;">
            <li>✅ ROI real de relojes de lujo (2020-2025)</li>
            <li>✅ Calculadora de retorno social</li>
            <li>✅ Top 10 experiencias que elevan tu status</li>
            <li>✅ Guía de networking para ejecutivos</li>
            <li>✅ Casos de estudio de 50 CEOs</li>
          </ul>
        </div>

        <form style="display: flex; gap: 0.5rem; margin: 1.5rem 0;" onsubmit="conversionOptimizer.handleExitOffer(event)">
          <input type="email" placeholder="tu@email.com" required style="flex: 1; margin: 0;">
          <button type="submit" class="btn primary">Descargar Gratis</button>
        </form>

        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button onclick="this.closest('.modal').remove()" class="btn">No, gracias</button>
        </div>
        
        <div style="margin-top: 1rem; font-size: 0.85rem; color: var(--muted);">
          📧 Sin spam • 🔐 Datos protegidos • ⭐ +8,950 descargas
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    if (window.track) {
      window.track('exit_intent_offer_shown', { userScore: this.userScore });
    }
  }

  startSocialProofRotation() {
    const socialProofData = [
      { name: 'Carlos M.', title: 'CEO, Tech Startup', action: 'se unió a Elite', time: '2 min' },
      { name: 'Ana S.', title: 'Directora de Marketing', action: 'descargó el reporte', time: '5 min' },
      { name: 'Roberto L.', title: 'Consultor Senior', action: 'compró vía afiliado', time: '8 min' },
      { name: 'María F.', title: 'VP de Ventas', action: 'se unió a Básico', time: '12 min' },
      { name: 'Diego R.', title: 'Fundador', action: 'asistió al masterclass', time: '15 min' }
    ];

    let currentIndex = 0;

    this.socialProofInterval = setInterval(() => {
      // Only show if user is engaged
      if (this.userScore >= 30) {
        this.showSocialProofNotification(socialProofData[currentIndex]);
        currentIndex = (currentIndex + 1) % socialProofData.length;
      }
    }, 25000); // Every 25 seconds
  }

  showSocialProofNotification(data) {
    // Remove existing notification
    const existing = document.querySelector('.social-proof-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'social-proof-notification';
    notification.style.cssText = `
      position: fixed; top: 100px; right: 20px; z-index: 75;
      background: var(--card); border: 1px solid var(--brand);
      padding: 1rem; border-radius: 12px; max-width: 300px;
      box-shadow: 0 10px 30px rgba(212,175,55,.3);
      animation: slideInRight 0.5s ease;
    `;
    
    notification.innerHTML = `
      <div style="display:flex; align-items:center; gap:.5rem; margin-bottom:.5rem">
        <div style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite"></div>
        <strong style="font-size: 0.9rem;">Actividad reciente</strong>
        <button onclick="this.closest('.social-proof-notification').remove()" 
                style="margin-left:auto; background:none; border:none; color:var(--text); opacity:.7; cursor:pointer;">×</button>
      </div>
      <div style="font-size:.85rem; line-height: 1.4; color: var(--muted);">
        <strong style="color: var(--text);">${data.name}</strong> ${data.action}<br>
        <span style="opacity:.8;">• ${data.title}</span><br>
        <span style="opacity:.7;">• Hace ${data.time}</span>
      </div>
    `;

    document.body.appendChild(notification);
    
    // Auto remove after 8 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => notification.remove(), 500);
      }
    }, 8000);

    if (window.track) {
      window.track('social_proof_shown', data);
    }
  }

  showLiveActivity() {
    const activityBanner = document.createElement('div');
    activityBanner.style.cssText = `
      position: fixed; bottom: 20px; left: 20px; z-index: 70;
      background: linear-gradient(135deg, var(--brand), var(--brand-2));
      color: #231a0a; padding: 0.75rem 1rem; border-radius: 8px;
      font-size: 0.9rem; font-weight: 600;
      box-shadow: 0 4px 20px rgba(212,175,55,.4);
      animation: slideInLeft 0.5s ease;
    `;
    
    activityBanner.innerHTML = `
      🔥 <strong>127 personas</strong> viendo esta página ahora
      <button onclick="this.parentElement.remove()" style="margin-left: 1rem; background: none; border: none; color: inherit; opacity: 0.8; cursor: pointer;">×</button>
    `;

    document.body.appendChild(activityBanner);
    
    setTimeout(() => activityBanner.remove(), 10000);
  }

  setupDynamicPricing() {
    // Show limited-time discounts for high-engagement users
    setTimeout(() => {
      if (this.userScore >= 60) {
        this.showDynamicDiscount();
      }
    }, 120000); // After 2 minutes
  }

  showDynamicDiscount() {
    const discountBanner = document.createElement('div');
    discountBanner.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; z-index: 80;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white; padding: 0.75rem; text-align: center;
      font-weight: 600; animation: slideDown 0.5s ease;
    `;
    
    discountBanner.innerHTML = `
      ⚡ <strong>OFERTA FLASH:</strong> 20% de descuento en membresía Elite - 
      <span id="flash-countdown">15:00</span> restantes
      <button onclick="this.parentElement.remove()" 
              style="margin-left: 1rem; background: none; border: 1px solid white; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer;">
        ×
      </button>
    `;

    document.body.appendChild(discountBanner);
    
    // Countdown timer
    let timeLeft = 15 * 60; // 15 minutes
    const countdownEl = discountBanner.querySelector('#flash-countdown');
    
    const countdown = setInterval(() => {
      timeLeft--;
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      if (timeLeft <= 0) {
        clearInterval(countdown);
        discountBanner.remove();
      }
    }, 1000);

    if (window.track) {
      window.track('dynamic_discount_shown', { userScore: this.userScore });
    }
  }

  setupPersonalization() {
    // Personalize content based on user behavior
    setTimeout(() => {
      this.personalizeContent();
    }, 5000);
  }

  personalizeContent() {
    // Personalize hero section based on engagement
    if (this.userScore >= 50) {
      const heroTitle = document.querySelector('.hero h1');
      if (heroTitle && !heroTitle.dataset.personalized) {
        heroTitle.innerHTML = 'Únete a los <span style="background:linear-gradient(135deg,var(--brand),var(--brand-2)); -webkit-background-clip:text; background-clip:text; color:transparent">8,950+ ejecutivos</span> que ya incrementaron sus ingresos';
        heroTitle.dataset.personalized = 'true';
      }
    }

    // Show personalized product recommendations
    if (this.userScore >= 40) {
      this.showPersonalizedRecommendations();
    }
  }

  showPersonalizedRecommendations() {
    const sidebar = document.createElement('div');
    sidebar.style.cssText = `
      position: fixed; right: 20px; top: 50%; transform: translateY(-50%);
      width: 280px; background: var(--card); border: 1px solid var(--brand);
      border-radius: 12px; padding: 1rem; z-index: 60;
      box-shadow: 0 10px 30px rgba(0,0,0,.3);
      animation: slideInRight 0.5s ease;
    `;
    
    sidebar.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="margin: 0; color: var(--brand); font-size: 1rem;">🎯 Para ti</h3>
        <button onclick="this.closest('div').remove()" 
                style="background: none; border: none; color: var(--text); opacity: 0.7; cursor: pointer;">×</button>
      </div>
      <div style="font-size: 0.9rem; color: var(--muted); margin-bottom: 1rem;">
        Basado en tu actividad, recomendamos:
      </div>
      <div style="display: grid; gap: 0.75rem;">
        <div style="border: 1px solid var(--brand); border-radius: 8px; padding: 0.75rem;">
          <strong style="font-size: 0.85rem;">Rolex Submariner</strong><br>
          <span style="color: var(--muted); font-size: 0.8rem;">Alta retención de valor</span><br>
          <button class="btn primary" style="margin-top: 0.5rem; font-size: 0.8rem; padding: 0.4rem 0.6rem; width: 100%;">
            Ver oferta
          </button>
        </div>
        <div style="border: 1px solid var(--accent); border-radius: 8px; padding: 0.75rem;">
          <strong style="font-size: 0.85rem;">Masterclass Elite</strong><br>
          <span style="color: var(--muted); font-size: 0.8rem;">Networking estratégico</span><br>
          <button class="btn" style="margin-top: 0.5rem; font-size: 0.8rem; padding: 0.4rem 0.6rem; width: 100%;">
            Acceder
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(sidebar);
    
    // Auto-hide after 30 seconds
    setTimeout(() => {
      if (sidebar.parentNode) {
        sidebar.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => sidebar.remove(), 500);
      }
    }, 30000);
  }

  // Handle conversion events
  handleVipUpgrade() {
    localStorage.setItem('sc-membership', 'elite');
    localStorage.setItem('sc-discount', '40');
    
    if (window.track) {
      window.track('subscribe', {
        plan: 'elite',
        discount: 40,
        source: 'vip_offer',
        userScore: this.userScore
      });
    }
    
    alert('🎉 ¡Bienvenido a StatusClub Elite VIP! \n\n✅ 40% de descuento aplicado\n📧 Revisa tu email para acceso inmediato\n🎯 Disfruta de todos los beneficios premium');
    document.querySelector('.modal')?.remove();
  }

  handleExitOffer(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    
    // Simulate lead capture
    const leads = JSON.parse(localStorage.getItem('sc-leads') || '[]');
    leads.push({
      type: 'exit_intent',
      email: email,
      at: Date.now(),
      userScore: this.userScore
    });
    localStorage.setItem('sc-leads', JSON.stringify(leads));
    
    if (window.track) {
      window.track('lead', {
        source: 'exit_intent',
        email: email,
        userScore: this.userScore
      });
    }
    
    // Show success message
    event.target.innerHTML = `
      <div style="text-align: center; color: var(--good); font-weight: 600;">
        ✅ ¡Perfecto! Revisa tu email en 2 minutos
      </div>
    `;
    
    setTimeout(() => {
      document.querySelector('.modal')?.remove();
    }, 3000);
  }

  // Cleanup
  destroy() {
    if (this.socialProofInterval) {
      clearInterval(this.socialProofInterval);
    }
    this.urgencyTimers.forEach(timer => clearTimeout(timer));
  }
}

// Add required CSS animations
const animationCSS = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  @keyframes slideInLeft {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideDown {
    from { transform: translateY(-100%); }
    to { transform: translateY(0); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
  }
`;

// Inject animations
const styleSheet = document.createElement('style');
styleSheet.textContent = animationCSS;
document.head.appendChild(styleSheet);

// Initialize conversion optimizer
const conversionOptimizer = new ConversionOptimizer();

// Export for global use
window.conversionOptimizer = conversionOptimizer;

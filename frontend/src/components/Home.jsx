import { useState, useEffect } from 'react';
import './Home.css';

function Home({ onNavigate }) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    const theme = newTheme ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  useEffect(() => {
    const container = document.querySelector('.physics-background');
    if (!container) return;


    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.setProperty('--tx', `${(Math.random() - 0.5) * 400}px`);
      particle.style.setProperty('--ty', `${(Math.random() - 0.5) * 400}px`);
      particle.style.animationDelay = `${Math.random() * 20}s`;
      particle.style.animationDuration = `${15 + Math.random() * 10}s`;
      container.appendChild(particle);
    }


    for (let i = 0; i < 8; i++) {
      const line = document.createElement('div');
      line.className = 'velocity-line';
      line.style.top = `${10 + i * 12}%`;
      line.style.left = `${-20}%`;
      line.style.width = `${40 + Math.random() * 60}px`;
      line.style.animationDelay = `${i * 1}s`;
      container.appendChild(line);
    }


    for (let i = 0; i < 4; i++) {
      const wave = document.createElement('div');
      wave.className = 'wave-line';
      wave.style.top = `${20 + i * 20}%`;
      wave.style.animationDuration = `${12 + i * 3}s`;
      wave.style.animationDelay = `${i * -3}s`;
      container.appendChild(wave);
    }


    for (let i = 0; i < 3; i++) {
      const orbit = document.createElement('div');
      orbit.className = 'orbit';
      const size = 100 + i * 80;
      orbit.style.width = `${size}px`;
      orbit.style.height = `${size}px`;
      orbit.style.left = `${20 + i * 25}%`;
      orbit.style.top = `${30 + i * 15}%`;
      orbit.style.animationDuration = `${20 + i * 10}s`;
      orbit.style.animationDirection = i % 2 === 0 ? 'normal' : 'reverse';
      
      const orbitParticle = document.createElement('div');
      orbitParticle.className = 'orbit-particle';
      orbitParticle.style.setProperty('--orbit-radius', `${size / 2}px`);
      orbitParticle.style.animationDuration = `${5 + i * 2}s`;
      orbit.appendChild(orbitParticle);
      
      container.appendChild(orbit);
    }


    for (let i = 0; i < 6; i++) {
      const arrow = document.createElement('div');
      arrow.className = 'acceleration-arrow';
      arrow.style.left = `${5 + i * 15}%`;
      arrow.style.top = `${60 + (i % 3) * 10}%`;
      arrow.style.animationDelay = `${i * 0.7}s`;
      container.appendChild(arrow);
    }

    return () => {
      container.innerHTML = '';
    };
  }, []);

  return (
    <div className="home-container">
      <div className="physics-background">
        <div className="physics-grid"></div>
      </div>
      <div className="home-content">
        <div className="hero-section">
          <h1 className="hero-title">Physics Motion Tracker</h1>
          <p className="hero-subtitle">
            Measure distance, velocity, acceleration, and time through any smartphone
          </p>
          <p className="hero-description">
            Real-time GPS tracking with precise physics calculations powered by OpenStreetMap and OpenRouteService API
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Real-Time Tracking</h3>
            <p>Track GPS coordinates with high accuracy using your smartphone's location services</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Physics Calculations</h3>
            <p>Automatic calculation of speed, velocity, acceleration, and displacement using standard formulas</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Live Map View</h3>
            <p>Interactive map with compass directions showing your path and current location</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Wireless Sync</h3>
            <p>Send location data from your phone and receive it on your laptop in real-time</p>
          </div>
        </div>

        <div className="cta-section">
          <h2>Get Started</h2>
          <div className="cta-buttons">
            <button 
              onClick={() => onNavigate('sender')}
              className="cta-btn cta-primary"
            >
              📱 Start as Sender (Phone)
            </button>
            <button 
              onClick={() => onNavigate('receiver')}
              className="cta-btn cta-secondary"
            >
              💻 Start as Receiver (Laptop)
            </button>
          </div>
        </div>

        <div className="info-section">
          <h3>How It Works</h3>
          <div className="steps">
            <div className="step">
              <span className="step-number">1</span>
              <div>
                <h4>Open on Phone</h4>
                <p>Navigate to Sender mode on your smartphone and start tracking</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <div>
                <h4>Open on Laptop</h4>
                <p>Navigate to Receiver mode on your laptop to view real-time data</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <div>
                <h4>View Physics Data</h4>
                <p>See live calculations of speed, velocity, acceleration, and more on the map</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

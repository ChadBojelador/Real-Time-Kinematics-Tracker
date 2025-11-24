import React, { useState, useEffect } from 'react';

const initialMotionData = {
    distance: 0.0,
    velocity: 0.00,
    acceleration: 0.00,
    time: 0.00
};

const getInitialGraphData = () => {
    const initialData = [];
  
    for (let i = 0; i < 50; i++) {
        initialData.push({
            x: i,
            y: 5 
        });
    }
    return initialData;
};

export default function PhysicsMotionTracker() {
  // Initialize state with all values at 0
  const [motionData, setMotionData] = useState(initialMotionData);
  const [isTracking, setIsTracking] = useState(false);
  const [graphData, setGraphData] = useState(getInitialGraphData); 

  // Function to reset all tracking data back to 0
  const resetTracking = () => {
    setIsTracking(false); // Stop tracking
    setMotionData(initialMotionData); 
    setGraphData(getInitialGraphData()); 
  };

  // Live tracking simulation effect
  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        setMotionData(prev => ({
          distance: parseFloat((prev.distance + Math.random() * 0.5).toFixed(1)),
          velocity: parseFloat((Math.random() * 3 + 1).toFixed(2)),
          acceleration: parseFloat((Math.random() * 1.5).toFixed(2)),
          time: parseFloat((prev.time + 0.1).toFixed(2))
        }));

       
        setGraphData(prev => {
          const newData = [...prev.slice(1)];
          const newY = 5 + (motionData.velocity * 10) + Math.random() * 5; 
          newData.push({
            x: prev[prev.length - 1].x + 1,
            y: newY
          });
          return newData;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isTracking, motionData.velocity]); 

  const maxY = Math.max(...graphData.map(d => d.y));
  const minY = Math.min(...graphData.map(d => d.y));
  const range = maxY - minY > 0 ? maxY - minY : 1; 
  
  const graphPadding = 20; 
  const effectiveWidth = 500 - (graphPadding * 2); 

  const normalizedGraphData = graphData.map(d => ({
    x: d.x,
    y: ((d.y - minY) / range) * 150 
  }));


  const points = normalizedGraphData.map((d, i) => {
    const x = graphPadding + (i / normalizedGraphData.length) * effectiveWidth; 
    const y = 150 - d.y; 
    return `${x},${y}`;
  }).join(' ');

  const firstPointX = graphPadding;
  const lastPointX = graphPadding + effectiveWidth; 

  const areaPoints = `${firstPointX},150 ${points} ${lastPointX},150`;

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: #ffffffff;
          min-height: 100vh;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .header-section {
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          padding: 3rem;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .header-content {
          flex: 1;
          min-width: 300px;
        }

        .main-title {
          font-size: 4.5rem;
          font-family: 'Poppins', sans-serif;
          color: #1f2937;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .subtitle {
        font-family: 'Poppins', sans-serif;
          color: #6b7280;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        
        /* Button Group for Start/Stop and Reset */
        .button-group {
            display: flex;
            gap: 1rem;
            align-items: center;
        }

        .btn-primary {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.3);
        }

        .btn-primary:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 6px 30px rgba(37, 99, 235, 0.4);
        }

        .btn-primary.active {
          background: #dc2626;
        }
        
        .btn-reset {
            background: #f3f4f6;
            color: #4b5563;
            border: 1px solid #d1d5db;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-reset:hover {
            background: #e5e7eb;
        }
        
        .btn-reset:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .phone-display {
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          min-width: 250px;
          position: relative;
  left: -19px; /* shifts left */
        }

        .metric {
          margin-bottom: 1.5rem;
        }

        .metric:last-child {
          margin-bottom: 0;
        }

        .metric-value {
          color: white;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .metric-value.large {
          font-size: 2.5rem;
        }

        .metric-label {
          color: #9ca3af;
          font-size: 0.875rem;
        }

        .features-grid {
        font-family: 'Poppins', sans-serif;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .feature-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-4px);
        }

        .icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 2rem;
        }

        .icon-blue {
          background: #dbeafe;
          color: #2563eb;
        }

        .icon-green {
          background: #dcfce7;
          color: #16a34a;
        }

        .icon-purple {
          background: #f3e8ff;
          color: #9333ea;
        }

        .feature-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .feature-desc {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .section {
        font-family: 'Poppins', sans-serif;
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          padding: 3rem;
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 2rem;
          color: #1f2937;
          margin-bottom: 2rem;
          font-weight: 700;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }

        .step {
          text-align: center;
        }

        .step-icon {
          width: 80px;
          height: 80px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 2.5rem;
          color: white;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        }

        .step-icon-1 {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .step-icon-2 {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        }

        .step-icon-3 {
          background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
        }

        .step-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .step-desc {
          color: #6b7280;
        }

        .demo-section-title {
            font-size: 2rem;
            color: #1f2937;
            margin-bottom: 0; /* Handled by container */
            font-weight: 700;
        }
        
        /* Container to align title and button */
        .demo-header-aligned { 
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem; 
        }

        /* Styles for the button next to the title */
        .graph-control-button {
            width: 40px; 
            height: 40px;
            background-color: #2563eb; 
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 10px rgba(37, 99, 235, 0.4);
            position: relative; 
        }

        .graph-control-button:hover {
            background-color: #1d4ed8;
            transform: scale(1.05);
        }

        .graph-control-button svg {
            fill: white;
            width: 18px; 
            height: 18px;
            margin-left: 2px; 
        }
        
        .graph-control-button svg:first-child {
            margin-left: 0; 
        }


        /* STYLES FOR THE LIVE DEMO GRAPH */
        .live-demo-graph-container {
            background: #1A202C; 
            border-radius: 16px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            padding: 1.5rem; 
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: flex-end; 
            justify-content: space-between;
            height: 200px; 
        }

        .live-demo-graph {
            position: absolute; 
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden; 
        }

        .graph-line {
            fill: none;
            stroke: #4299E1; 
            stroke-width: 3;
            stroke-linecap: round;
            stroke-linejoin: round;
            transition: stroke 0.3s ease-out; 
        }

        .graph-area {
            fill: url(#gradientBlue); 
        }

        .graph-label-ms {
            position: absolute;
            top: 1rem;
            left: 1.5rem;
            color: #A0AEC0; 
            font-size: 0.875rem;
            font-weight: 500;
            z-index: 1; 
        }

        .graph-label-bottom {
            position: absolute;
            bottom: 1rem;
            color: #A0AEC0;
            font-size: 0.875rem;
            font-weight: 500;
            z-index: 1; 
        }

        .graph-label-bottom.left {
            left: 1.5rem;
        }

        .graph-label-bottom.center {
            left: 50%;
            transform: translateX(-50%);
        }

        .graph-label-bottom.right {
            right: 1.5rem;
        }
        
        .teacher-section {
        font-family: 'Poppins', sans-serif;
          background: #4f46e5;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          padding: 3rem;
          color: white;
        }

        .teacher-title {
        font-family: 'Poppins', sans-serif;
          font-size: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .teacher-desc {
          color: #bfdbfe;
          margin-bottom: 2rem;
        }

        .btn-secondary {
          background: white;
          color: #3d3d3dff;
          border: none;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
        }

        .btn-secondary:hover {
          background: #eff6ff;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }

          .header-section {
            padding: 2rem;
          }

          .main-title {
            font-size: 2rem;
          }

          .section {
            padding: 2rem;
          }
          


        }
          .footer-section {
          padding: 2rem 1rem; /* Balanced spacing */
          margin-top: 3rem;
          text-align: center;
          color: black;
          font-size: 0.95rem; /* Slightly larger font */
          font-family: 'Roboto', sans-serif; /* Clean modern font */
          letter-spacing: 0.5px; /* Slight spacing for readability */
        }
      `}</style>

      <div className="container">
        <div className="header-section">
          <div className="header-content">
            <h1 className="main-title">Physics Motion Tracker</h1>
            <p className="subtitle">
              Measure distance, velocity, acceleration, and time through any cell-smart phone.
            </p>
            {/* Button Group for Start/Stop and Reset */}
            <div className="button-group">
                <button 
                  className={`btn-primary ${isTracking ? 'active' : ''}`}
                  onClick={() => setIsTracking(!isTracking)}
                >
                  {isTracking ? 'Stop Tracking' : 'Get Started'}
                </button>
                <button 
                  className="btn-reset"
                  onClick={resetTracking}
                  disabled={isTracking}
                >
                  Reset
                </button>
            </div>
          </div>
          
          <div className="phone-display">
            <div className="metric">
              <div className="metric-value large">{motionData.distance.toFixed(1)} m</div>
              <div className="metric-label">Distance</div>
            </div>
            <div className="metric">
              <div className="metric-value">{motionData.velocity.toFixed(2)} m/s</div>
              <div className="metric-label">Velocity</div>
            </div>
            <div className="metric">
              <div className="metric-value">{motionData.acceleration.toFixed(2)} m/s²</div>
              <div className="metric-label">Acceleration</div>
            </div>
            <div className="metric">
              <div className="metric-value">{motionData.time.toFixed(2)} s</div>
              <div className="metric-label">Time</div>
            </div>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="icon-circle icon-blue">📊</div>
            <h3 className="feature-title">Real-time Data</h3>
            <p className="feature-desc">Continuous tracking and monitoring</p>
          </div>
          
          <div className="feature-card">
            <div className="icon-circle icon-green">📈</div>
            <h3 className="feature-title">Live Graphs</h3>
            <p className="feature-desc">Real-time visualization</p>
          </div>
          
          <div className="feature-card">
            <div className="icon-circle icon-purple">📱</div>
            <h3 className="feature-title">Easy-to-Use</h3>
            <p className="feature-desc">Optimized controls</p>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-icon step-icon-1">📱</div>
              <h3 className="step-title">Enable Sensors</h3>
              <p className="step-desc">Enable the accelerometers</p>
            </div>
            
            <div className="step">
              <div className="step-icon step-icon-2">〰️</div>
              <h3 className="step-title">Track Motion</h3>
              <p className="step-desc">Record object movement</p>
            </div>
            
            <div className="step">
              <div className="step-icon step-icon-3">📊</div>
              <h3 className="step-title">View Data</h3>
              <p className="step-desc">Analyze measurements</p>
            </div>
          </div>
        </div>

        <div className="section">
            <div className="demo-header-aligned"> 
                <h2 className="demo-section-title">Live Demo</h2>
                <div 
                    className="graph-control-button" 
                    onClick={() => setIsTracking(!isTracking)}
                >
                    {isTracking ? (
                        <svg viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    )}
                </div>
            </div>
            <div className="live-demo-graph-container">
                <svg className="live-demo-graph" viewBox="0 0 500 150" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="gradientBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#4299E1" stopOpacity="0.7"/>
                            <stop offset="100%" stopColor="#1A202C" stopOpacity="0"/>
                        </linearGradient>
                    </defs>
                    
                    <polyline 
                        points={points}
                        className="graph-line"
                    />
                    
                    {/* Area under the curve */}
                    <polyline 
                        points={areaPoints}
                        className="graph-area"
                    />
                </svg>

                <span className="graph-label-ms">m/s</span>
                <span className="graph-label-bottom left">0</span>
                <span className="graph-label-bottom right">5</span>
                
            </div>
        </div>

        <div className="teacher-section">
          <h2 className="teacher-title">For Teachers</h2>
          <p className="teacher-desc">
            A powerful tool for demonstrating motion concepts in the classroom
          </p>
          <button className="btn-secondary">Learn More</button>
        </div>


          <div className="footer-section">
            <p>2025 Physics Motion Tracker. All rights reserved.</p>
          </div>

      </div>
    </>
  );
}

//testinggg
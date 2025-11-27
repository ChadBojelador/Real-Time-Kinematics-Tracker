import { useState, useEffect } from 'react';

function Sender() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('Ready to track');
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const [watchId, setWatchId] = useState(null);

  const API_URL = 'http://192.168.1.163:3001';

  const sendLocation = async (position) => {
    const data = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      speed: position.coords.speed,
      timestamp: position.timestamp
    };

    setLocation(data);
    
    try {
      const response = await fetch(`${API_URL}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        setStatus('Location sent at ' + new Date().toLocaleTimeString());
      } else {
        setError('Failed to send location');
      }
    } catch (err) {
      setError('Failed to send location: ' + err.message);
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    setError(null);
    setStatus('Tracking started...');

    const id = navigator.geolocation.watchPosition(
      sendLocation,
      (err) => {
        setError('Error getting location: ' + err.message);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    setStatus('Tracking stopped');
  };

  const resetSender = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    setLocation(null);
    setError(null);
    setStatus('Ready to track');
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <div className="sender-root">
      <h2 className="section-title">GPS Sender (Phone)</h2>

      <div style={{ marginBottom: '18px' }}>
        <button 
          onClick={startTracking} 
          disabled={isTracking}
          className="btn btn-primary"
          style={{ marginRight: 10 }}
        >
          Start Tracking
        </button>
        <button 
          onClick={stopTracking} 
          disabled={!isTracking}
          className="btn btn-ghost"
        >
          Stop Tracking
        </button>
        <button
          onClick={resetSender}
          className="btn btn-secondary"
          style={{ marginLeft: 10 }}
        >
          Reset
        </button>
      </div>

      <div className="status small">Status: {status}</div>

      {error && (
        <div className="error"><strong>Error:</strong> {error}</div>
      )}

      {location && (
        <div className="card" style={{ background: 'linear-gradient(90deg,#e6fbff,#f0fff8)' }}>
          <h3 style={{ marginTop: 0 }}>Current Location</h3>
          <div className="location-grid">
            <div className="location-item"><strong>Latitude</strong><div className="small">{location.latitude.toFixed(6)}</div></div>
            <div className="location-item"><strong>Longitude</strong><div className="small">{location.longitude.toFixed(6)}</div></div>
            <div className="location-item"><strong>Speed</strong><div className="small">{location.speed ? `${location.speed.toFixed(2)} m/s` : 'N/A'}</div></div>
            <div className="location-item"><strong>Timestamp</strong><div className="small">{new Date(location.timestamp).toLocaleString()}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sender;

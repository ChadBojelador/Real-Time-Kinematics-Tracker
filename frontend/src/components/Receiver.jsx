import { useState, useEffect } from 'react';

function Receiver() {
  const [location, setLocation] = useState(null);
  const [previousLocation, setPreviousLocation] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  const API_URL = 'http://192.168.1.163:3001';

  // Haversine formula to calculate distance between two GPS coordinates
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const calculateStats = (current, previous) => {
    if (!previous) return null;

    const distance = haversineDistance(
      previous.latitude,
      previous.longitude,
      current.latitude,
      current.longitude
    );

    const timeDiff = (current.timestamp - previous.timestamp) / 1000; // seconds
    const speed = timeDiff > 0 ? distance / timeDiff : 0;

    // Calculate velocity components (degrees per second)
    const latVelocity = timeDiff > 0 ? (current.latitude - previous.latitude) / timeDiff : 0;
    const lonVelocity = timeDiff > 0 ? (current.longitude - previous.longitude) / timeDiff : 0;

    return {
      distance: distance.toFixed(2),
      speed: speed.toFixed(2),
      timeDiff: timeDiff.toFixed(2),
      velocity: {
        lat: latVelocity.toFixed(8),
        lon: lonVelocity.toFixed(8)
      }
    };
  };

  const fetchLocation = async () => {
    try {
      const response = await fetch(`${API_URL}/location`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('No location data available yet. Start the sender first.');
        } else {
          throw new Error('Failed to fetch location');
        }
        return;
      }
      
      const data = await response.json();
      
      if (data && data.latitude) {
        setError(null);
        
        // If we have a previous location, calculate stats
        if (location && location.timestamp !== data.timestamp) {
          const calculatedStats = calculateStats(data, location);
          setStats(calculatedStats);
          setPreviousLocation(location);
        }
        
        setLocation(data);
      }
    } catch (err) {
      setError('Failed to fetch location: ' + err.message);
    }
  };

  const startPolling = () => {
    setIsPolling(true);
    fetchLocation();
  };

  const stopPolling = () => {
    setIsPolling(false);
  };

  const resetReceiver = () => {
    setIsPolling(false);
    setLocation(null);
    setPreviousLocation(null);
    setStats(null);
    setError(null);
  };

  useEffect(() => {
    let interval;
    if (isPolling) {
      interval = setInterval(fetchLocation, 3000); // Poll every 3 seconds
    }
    return () => clearInterval(interval);
  }, [isPolling, location]);

  return (
    <div className="receiver-root">
      <h2 className="section-title">GPS Receiver (Laptop)</h2>

      <div style={{ marginBottom: '18px' }}>
        <button 
          onClick={startPolling} 
          disabled={isPolling}
          className="btn btn-primary"
          style={{ marginRight: 10 }}
        >
          Start Receiving
        </button>
        <button 
          onClick={stopPolling} 
          disabled={!isPolling}
          className="btn btn-ghost"
        >
          Stop Receiving
        </button>
        <button
          onClick={resetReceiver}
          className="btn btn-secondary"
          style={{ marginLeft: 10 }}
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="error"><strong>Error:</strong> {error}</div>
      )}

      {location && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Latest Location</h3>
          <div className="location-grid">
            <div className="location-item"><strong>Latitude</strong><div className="small">{location.latitude.toFixed(6)}</div></div>
            <div className="location-item"><strong>Longitude</strong><div className="small">{location.longitude.toFixed(6)}</div></div>
            <div className="location-item"><strong>Speed (GPS)</strong><div className="small">{location.speed ? `${location.speed.toFixed(2)} m/s` : 'N/A'}</div></div>
            <div className="location-item"><strong>Timestamp</strong><div className="small">{new Date(location.timestamp).toLocaleString()}</div></div>
            <div className="location-item"><strong>Received at</strong><div className="small">{location.receivedAt ? new Date(location.receivedAt).toLocaleString() : 'N/A'}</div></div>
          </div>
        </div>
      )}

      {stats && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Calculated Statistics</h3>
          <div className="stats">
            <div className="location-item"><strong>Distance</strong><div className="small">{stats.distance} meters</div></div>
            <div className="location-item"><strong>Calc Speed</strong><div className="small">{stats.speed} m/s ({(stats.speed * 3.6).toFixed(2)} km/h)</div></div>
            <div className="location-item"><strong>Δ Time</strong><div className="small">{stats.timeDiff} s</div></div>
            <div className="location-item"><strong>Vel Lat</strong><div className="small">{stats.velocity.lat} °/s</div></div>
            <div className="location-item"><strong>Vel Lon</strong><div className="small">{stats.velocity.lon} °/s</div></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Receiver;

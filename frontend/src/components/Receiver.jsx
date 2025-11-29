import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


function CompassControl() {
  const map = useMap();
  
  useEffect(() => {
    const compassDiv = L.DomUtil.create('div', 'leaflet-control-compass');
    compassDiv.innerHTML = `
      <div style="background: white; padding: 8px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-size: 11px; font-weight: bold; text-align: center; line-height: 1.4;">
        <div style="margin-bottom: 2px;">N</div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>W</span>
          <span style="font-size: 16px; margin: 0 6px;">⊕</span>
          <span>E</span>
        </div>
        <div style="margin-top: 2px;">S</div>
      </div>
    `;
    
    const compassControl = L.Control.extend({
      options: { position: 'topright' },
      onAdd: function() { return compassDiv; }
    });
    
    const control = new compassControl();
    control.addTo(map);
    
    return () => {
      control.remove();
    };
  }, [map]);
  
  return null;
}


function MapUpdater({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, 16);
    }
  }, [center, map]);
  
  return null;
}

function Receiver() {
  const [location, setLocation] = useState(null);
  const [previousLocation, setPreviousLocation] = useState(null);
  const [stats, setStats] = useState(null);
  const [previousStats, setPreviousStats] = useState(null);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  const API_URL = 'http://192.168.1.163:3001';
  const OPENROUTE_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjVlNmRkOGFmZjY1YzQyZWJiMjM3YWVjZTMzNDYwMzM1IiwiaCI6Im11cm11cjY0In0='; // Replace with your API key from https://openrouteservice.org


  const getDistanceFromOpenRoute = async (lat1, lon1, lat2, lon2) => {
    try {
      const url = `https://api.openrouteservice.org/v2/matrix/driving`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': OPENROUTE_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locations: [[lon1, lat1], [lon2, lat2]],
          metrics: ['distance']
        })
      });
      
      const data = await response.json();
      
      if (data.distances && data.distances[0] && data.distances[0][1]) {
        return data.distances[0][1]; 
      }
      
      throw new Error('Unable to calculate distance from OpenRouteService API');
    } catch (err) {
      console.error('OpenRouteService API error:', err);
      return null;
    }
  };

  const calculateStats = async (current, previous, prevStats) => {
    if (!previous) return null;

    const distance = await getDistanceFromOpenRoute(
      previous.latitude,
      previous.longitude,
      current.latitude,
      current.longitude
    );

    if (distance === null) {
      setError('Failed to calculate distance using OpenRouteService API');
      return null;
    }

    // Time difference in seconds: Δt = t₂ - t₁
    const timeDiff = (current.timestamp - previous.timestamp) / 1000;
    
    if (timeDiff === 0) return null;

    // Speed (scalar): v = distance / time
    const speed = distance / timeDiff;

    // Velocity components (vector): v = Δs / Δt
    const latDisplacement = current.latitude - previous.latitude;
    const lonDisplacement = current.longitude - previous.longitude;
    const latVelocity = latDisplacement / timeDiff;
    const lonVelocity = lonDisplacement / timeDiff;

    // Velocity magnitude (m/s)
    const velocityMagnitude = speed;

    // Acceleration: a = (v₂ - v₁) / Δt
    let acceleration = 0;
    let latAcceleration = 0;
    let lonAcceleration = 0;
    
    if (prevStats) {
      // Acceleration (scalar): a = Δv / Δt
      acceleration = (speed - parseFloat(prevStats.speed)) / timeDiff;
      
      // Acceleration components (vector): a = Δv / Δt
      latAcceleration = (latVelocity - parseFloat(prevStats.velocity.lat)) / timeDiff;
      lonAcceleration = (lonVelocity - parseFloat(prevStats.velocity.lon)) / timeDiff;
    }

    return {
      distance: distance.toFixed(2),
      speed: speed.toFixed(2),
      timeDiff: timeDiff.toFixed(2),
      velocity: {
        lat: latVelocity.toFixed(8),
        lon: lonVelocity.toFixed(8),
        magnitude: velocityMagnitude.toFixed(2)
      },
      acceleration: {
        scalar: acceleration.toFixed(4),
        lat: latAcceleration.toFixed(8),
        lon: lonAcceleration.toFixed(8)
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
        
        
        if (location && location.timestamp !== data.timestamp) {
          const calculatedStats = await calculateStats(data, location, stats);
          if (calculatedStats) {
            setPreviousStats(stats);
            setStats(calculatedStats);
            setPreviousLocation(location);
          }
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
    setPreviousStats(null);
    setError(null);
  };

  useEffect(() => {
    let interval;
    if (isPolling) {
      interval = setInterval(fetchLocation, 3000); 
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
            <div className="location-item"><strong>Distance (Δs)</strong><div className="small">{stats.distance} m</div></div>
            <div className="location-item"><strong>Time Interval (Δt)</strong><div className="small">{stats.timeDiff} s</div></div>
            <div className="location-item"><strong>Speed (v = Δs/Δt)</strong><div className="small">{stats.speed} m/s ({(stats.speed * 3.6).toFixed(2)} km/h)</div></div>
            <div className="location-item"><strong>Velocity Magnitude</strong><div className="small">{stats.velocity.magnitude} m/s</div></div>
            <div className="location-item"><strong>Velocity Lat (v_y)</strong><div className="small">{stats.velocity.lat} °/s</div></div>
            <div className="location-item"><strong>Velocity Lon (v_x)</strong><div className="small">{stats.velocity.lon} °/s</div></div>
            {stats.acceleration && parseFloat(stats.acceleration.scalar) !== 0 && (
              <>
                <div className="location-item"><strong>Acceleration (a = Δv/Δt)</strong><div className="small">{stats.acceleration.scalar} m/s²</div></div>
                <div className="location-item"><strong>Accel Lat (a_y)</strong><div className="small">{stats.acceleration.lat} °/s²</div></div>
                <div className="location-item"><strong>Accel Lon (a_x)</strong><div className="small">{stats.acceleration.lon} °/s²</div></div>
              </>
            )}
          </div>
        </div>
      )}

      {location && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <h3 style={{ margin: '12px 16px' }}>Live Map</h3>
          <MapContainer 
            center={[location.latitude, location.longitude]} 
            zoom={16} 
            style={{ height: '300px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[location.latitude, location.longitude]}>
              <Popup>
                Current Location<br />
                Lat: {location.latitude.toFixed(6)}<br />
                Lon: {location.longitude.toFixed(6)}
              </Popup>
            </Marker>
            {previousLocation && (
              <Polyline 
                positions={[
                  [previousLocation.latitude, previousLocation.longitude],
                  [location.latitude, location.longitude]
                ]} 
                color="blue"
                weight={3}
              />
            )}
            <CompassControl />
            <MapUpdater center={[location.latitude, location.longitude]} />
          </MapContainer>
        </div>
      )}
    </div>
  );
}

export default Receiver;

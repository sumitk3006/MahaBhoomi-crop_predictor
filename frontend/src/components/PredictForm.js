import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';
// Recharts removed from PredictForm; market charts live on ResultPage
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { motion } from 'framer-motion';

L.Icon.Default.mergeOptions({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng
});

const PredictForm = () => {
  const [formData, setFormData] = useState({ Rainfall: '', Area: '', District_Name: '', Season_Encoded: '', Soil_Quality_Encoded: '', Crop: '' });
  const [result, setResult] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [mapInfo, setMapInfo] = useState({ center: [19.7515, 75.7139], zoom: 7, markers: [] });
  const resultRef = useRef(null);
  const navigate = useNavigate();

  const districtCoordinates = {
    Ahmednagar: [19.0948, 74.7477], Akola: [20.7096, 77.0085], Amravati: [20.9374, 77.7796],
    Aurangabad: [19.8762, 75.3433], Beed: [18.9891, 75.7601], Bhandara: [21.1667, 79.65],
    Buldhana: [20.5293, 76.1804], Chandrapur: [19.9615, 79.2961], Dhule: [20.9042, 74.7749],
    Gadchiroli: [20.1926, 80.0035], Gondia: [21.4602, 80.192], Hingoli: [19.719, 77.1474],
    Jalgaon: [21.0077, 75.5626], Jalna: [19.841, 75.8864], Kolhapur: [16.705, 74.2433],
    Latur: [18.4088, 76.5604], Mumbai: [19.076, 72.8777], Nagpur: [21.1458, 79.0882],
    Nanded: [19.1383, 77.321], Nandurbar: [21.3662, 74.239], Nashik: [20.0059, 73.791],
    Osmanabad: [18.186, 76.0419], Parbhani: [19.2704, 76.7601], Pune: [18.5204, 73.8567],
    Raigad: [18.5236, 73.2896], Ratnagiri: [16.9902, 73.312], Sangli: [16.8544, 74.5815],
    Satara: [17.6805, 74.0183], Sindhudurg: [16.1236, 73.691], Solapur: [17.6599, 75.9064],
    Thane: [19.2183, 72.9781], Wardha: [20.7381, 78.5967], Washim: [20.1114, 77.1334], Yavatmal: [20.3893, 78.1306]
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'District_Name' && districtCoordinates[value]) {
      setMapInfo({ center: districtCoordinates[value], zoom: 10, markers: [{ position: districtCoordinates[value], label: value }] });
      // Fetch real-time weather data for the selected district
      fetchWeatherData(value, districtCoordinates[value]);
    }
    // Market trends are rendered on the dashboard/result page
  };

  // Market trend fetching moved to ResultPage (dashboard)

  const fetchWeatherData = async (district, coordinates) => {
    setLoadingWeather(true);
    try {
      console.log(`Fetching weather for ${district} at ${coordinates}`);
      
      const response = await fetch('http://localhost:5000/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          district: district,
          latitude: coordinates[0],
          longitude: coordinates[1]
        })
      });
      
      console.log('Weather API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Weather data received:', data);
        setWeatherData(data);
        
        // Auto-fill Rainfall field based on weather data
        if (data.rain !== undefined) {
          setFormData(prev => ({ ...prev, Rainfall: Math.round(data.rain * 100) || 50 }));
        } else if (data.description && data.description.toLowerCase().includes('rain')) {
          // If raining, auto-fill with estimated rainfall
          setFormData(prev => ({ ...prev, Rainfall: 75 }));
        } else if (data.humidity > 70) {
          // If high humidity, assume moderate rainfall
          setFormData(prev => ({ ...prev, Rainfall: 50 }));
        } else {
          // Default low rainfall
          setFormData(prev => ({ ...prev, Rainfall: 25 }));
        }
        
        // Auto-fill Season based on weather data
        if (data.season) {
          const seasonMap = {
            'Rabi': 'Rabi',
            'Kharif': 'Kharif',
            'Whole Year': 'Whole Year'
          };
          const detectedSeason = Object.keys(seasonMap).find(s => 
            data.season.toLowerCase().includes(s.toLowerCase()) || 
            data.season.toLowerCase().includes(s.split(' ')[0].toLowerCase())
          );
          if (detectedSeason) {
            setFormData(prev => ({ ...prev, Season_Encoded: detectedSeason }));
          }
        }
      } else {
        console.error('Weather API error:', response.status, response.statusText);
        // Set fallback weather data
        setWeatherData({
          temperature: 28,
          humidity: 65,
          wind_speed: 12,
          pressure: 1013,
          description: 'Data unavailable',
          season: 'Season detection',
          status: 'fallback'
        });
        setFormData(prev => ({ ...prev, Rainfall: 50 }));
      }
    } catch (err) {
      console.error('Error fetching weather:', err);
      // Set fallback weather data
      setWeatherData({
        temperature: 28,
        humidity: 65,
        wind_speed: 12,
        pressure: 1013,
        description: 'Connection error',
        season: 'Check backend',
        status: 'error'
      });
      setFormData(prev => ({ ...prev, Rainfall: 50 }));
    } finally {
      setLoadingWeather(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      // Navigate to the new dashboard with all the detailed data
      navigate('/result', { state: data });
    } catch (err) {
      console.error(err);
      alert('Error making prediction. Please try again.');
    }
  };

  const ChangeMapCenter = ({ center }) => {
    useMap().flyTo(center, 10, { duration: 1.5 });
    return null;
  };

  const downloadPDF = () => {
    const input = document.getElementById('pdfContent');
    html2canvas(input, { scale: 2, useCORS: true }).then(canvas => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, width, height);
      pdf.save('crop_prediction_report.pdf');
    });
  };

  return (
    <div className="container-fluid bg-body-secondary py-5 min-vh-100">
      <motion.h2 className="text-center text-primary mb-5 fw-bold" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        🌾 Crop Yield Prediction
      </motion.h2>

      <div className="row justify-content-center">
        {/* Form Card */}
        <div className="col-md-5">
          <motion.div className="card shadow-lg border-0 rounded-4 bg-light p-4 mb-4" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
            <form onSubmit={handleSubmit}>
              {['Rainfall', 'Area'].map((field, i) => (
                <div className="mb-3" key={i}>
                  <label className="form-label">{field} {field === 'Rainfall' ? '(mm)' : '(Ha)'}</label>
                  <input type="number" className="form-control" name={field} value={formData[field]} onChange={handleChange} required />
                </div>
              ))}
              {[{
                name: 'District_Name', label: 'District', options: Object.keys(districtCoordinates)
              }, {
                name: 'Season_Encoded', label: 'Season', options: ['Rabi', 'Kharif', 'Whole Year']
              }, {
                name: 'Soil_Quality_Encoded', label: 'Soil Quality', options: ['Poor', 'Moderate', 'Good']
              }, {
                name: 'Crop', label: 'Crop', options: ['Groundnut', 'Cotton', 'Rice', 'Barley', 'Gram', 'Maize', 'Mustard', 'Peas', 'Pulses', 'Soybean', 'Sugarcane']
              }].map(({ name, label, options }) => (
                <div className="mb-3" key={name}>
                  <label className="form-label">{label}</label>
                  <select className="form-select" name={name} value={formData[name]} onChange={handleChange} required>
                    <option value="">Select {label}</option>
                    {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
              <button type="submit" className="btn btn-primary w-100 shadow-sm fw-semibold">
                Predict & View Dashboard
              </button>
            </form>

            {/* Real-time Weather Data Display */}
            {weatherData && (
              <motion.div className="mt-4 p-3 rounded-3 bg-success bg-opacity-10 border border-success border-opacity-25" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h6 className="text-success fw-bold mb-3">🌤️ Real-Time Weather Data</h6>
                <div className="row g-2">
                  <div className="col-6">
                    <div className="small">
                      <strong>Temperature:</strong>
                      <span className="ms-2">{weatherData.temperature}°C</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="small">
                      <strong>Humidity:</strong>
                      <span className="ms-2">{weatherData.humidity}%</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="small">
                      <strong>Wind Speed:</strong>
                      <span className="ms-2">{weatherData.wind_speed} km/h</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="small">
                      <strong>Pressure:</strong>
                      <span className="ms-2">{weatherData.pressure} hPa</span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="small">
                      <strong>Condition:</strong>
                      <span className="ms-2 text-capitalize">{weatherData.description}</span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="small">
                      <strong>Season:</strong>
                      <span className="ms-2 badge bg-success">{weatherData.season}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Market trends are shown on the Result/Dashboard page now */}

            {loadingWeather && (
              <div className="mt-3 text-center">
                <div className="spinner-border spinner-border-sm text-success" role="status">
                  <span className="visually-hidden">Loading weather...</span>
                </div>
                <small className="d-block mt-2 text-muted">Fetching real-time weather data...</small>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Weather Map with Temperature/Rainfall Visualization */}
      <motion.div className="mt-4" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <h5 className="text-center text-secondary mb-3">🗺️ Weather Map - {formData.District_Name || 'Select District'}</h5>
        <div className="card shadow-lg border-0 rounded-4 p-3 mb-4">
          {weatherData && (
            <div>
              {/* Weather Map with color overlay */}
              <div className="rounded-3 overflow-hidden position-relative" style={{ height: '450px' }}>
                <MapContainer center={mapInfo.center} zoom={mapInfo.zoom} style={{ height: '100%', width: '100%' }}>
                  <ChangeMapCenter center={mapInfo.center} />
                  <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  
                  {/* Temperature Heatmap Overlay - Circle representing temperature zone */}
                  {mapInfo.markers.map((marker, i) => {
                    const tempColor = weatherData.temperature < 20 ? '#3498db' : 
                                     weatherData.temperature < 25 ? '#2ecc71' : 
                                     weatherData.temperature < 30 ? '#f39c12' : '#e74c3c';
                    
                    return (
                      <Marker key={i} position={marker.position} icon={L.icon({ iconUrl: markerIconPng, shadowUrl: markerShadowPng })}>
                        <Popup>
                          <div style={{ minWidth: '200px' }}>
                            <h6 className="mb-2">{marker.label}</h6>
                            <hr className="my-2" />
                            <p className="mb-1"><strong>🌡️ Temperature:</strong> {weatherData.temperature}°C</p>
                            <p className="mb-1"><strong>💧 Humidity:</strong> {weatherData.humidity}%</p>
                            <p className="mb-1"><strong>💨 Wind:</strong> {weatherData.wind_speed} km/h</p>
                            <p className="mb-1"><strong>📊 Pressure:</strong> {weatherData.pressure} hPa</p>
                            <p className="mb-0"><strong>☁️ Condition:</strong> {weatherData.description}</p>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>

                {/* Weather Legend Overlay */}
                <div className="position-absolute" style={{ bottom: '15px', left: '15px', zIndex: 1000, backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                  <h6 className="mb-2 fw-bold">🌡️ Temperature Zones</h6>
                  <div className="d-flex flex-column gap-1" style={{ fontSize: '0.85rem' }}>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: '20px', height: '20px', backgroundColor: '#3498db', borderRadius: '3px' }}></div>
                      <span>Cold (&lt; 20°C)</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: '20px', height: '20px', backgroundColor: '#2ecc71', borderRadius: '3px' }}></div>
                      <span>Cool (20-25°C)</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: '20px', height: '20px', backgroundColor: '#f39c12', borderRadius: '3px' }}></div>
                      <span>Warm (25-30°C)</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: '20px', height: '20px', backgroundColor: '#e74c3c', borderRadius: '3px' }}></div>
                      <span>Hot (&gt; 30°C)</span>
                    </div>
                  </div>

                  <hr className="my-2" />

                  <h6 className="mb-2 fw-bold">💧 Humidity Zones</h6>
                  <div className="d-flex flex-column gap-1" style={{ fontSize: '0.85rem' }}>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: '20px', height: '20px', backgroundColor: '#e74c3c', borderRadius: '3px' }}></div>
                      <span>Dry (&lt; 40%)</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: '20px', height: '20px', backgroundColor: '#f39c12', borderRadius: '3px' }}></div>
                      <span>Moderate (40-60%)</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: '20px', height: '20px', backgroundColor: '#3498db', borderRadius: '3px' }}></div>
                      <span>High (60-80%)</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: '20px', height: '20px', backgroundColor: '#16a085', borderRadius: '3px' }}></div>
                      <span>Very High (&gt; 80%)</span>
                    </div>
                  </div>
                </div>

                {/* Current Weather Info Box */}
                <div className="position-absolute" style={{ top: '15px', right: '15px', zIndex: 1000, backgroundColor: 'rgba(255,255,255,0.95)', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', minWidth: '220px' }}>
                  <div className="text-center mb-2">
                    <h6 className="mb-1 fw-bold">{formData.District_Name || 'District'}</h6>
                    <small className="text-muted">Real-time Weather Data</small>
                  </div>
                  <hr className="my-2" />
                  <div style={{ fontSize: '0.9rem' }}>
                    <p className="mb-2"><span style={{ fontSize: '2rem' }}>
                      {weatherData.temperature < 20 ? '❄️' : 
                       weatherData.temperature < 25 ? '🌤️' : 
                       weatherData.temperature < 30 ? '☀️' : '🔥'}
                    </span></p>
                    <p className="mb-1"><strong>{weatherData.temperature}°C</strong></p>
                    <p className="mb-1 text-capitalize" style={{ fontSize: '0.85rem' }}>{weatherData.description}</p>
                    <hr className="my-2" />
                    <p className="mb-1"><small>💧 {weatherData.humidity}% Humidity</small></p>
                    <p className="mb-1"><small>💨 {weatherData.wind_speed} km/h Wind</small></p>
                    <p className="mb-0"><small>📊 {weatherData.pressure} hPa</small></p>
                  </div>
                </div>
              </div>

              {/* Weather Summary Stats */}
              <div className="row g-2 mt-3">
                <div className="col-md-3">
                  <div className="p-2 rounded-2 text-center" style={{ backgroundColor: `${weatherData.temperature < 20 ? '#e3f2fd' : weatherData.temperature < 25 ? '#e8f5e9' : weatherData.temperature < 30 ? '#fff3e0' : '#ffebee'}` }}>
                    <small className="d-block text-muted">Temperature Trend</small>
                    <strong style={{ fontSize: '1.2rem' }}>{weatherData.temperature}°C</strong>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-2 rounded-2 text-center" style={{ backgroundColor: `${weatherData.humidity < 40 ? '#ffebee' : weatherData.humidity < 60 ? '#fff3e0' : weatherData.humidity < 80 ? '#e3f2fd' : '#e0f2f1'}` }}>
                    <small className="d-block text-muted">Humidity Level</small>
                    <strong style={{ fontSize: '1.2rem' }}>{weatherData.humidity}%</strong>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-2 rounded-2 text-center bg-info bg-opacity-10">
                    <small className="d-block text-muted">Wind Speed</small>
                    <strong style={{ fontSize: '1.2rem' }}>{weatherData.wind_speed} km/h</strong>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-2 rounded-2 text-center bg-warning bg-opacity-10">
                    <small className="d-block text-muted">Air Pressure</small>
                    <strong style={{ fontSize: '1.2rem' }}>{weatherData.pressure} hPa</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PredictForm;

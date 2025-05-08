import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
  const resultRef = useRef(null);

  const [mapInfo, setMapInfo] = useState({ center: [19.7515, 75.7139], zoom: 7, markers: [] });

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
      const area = parseFloat(formData.Area);
      const production = parseFloat(data.predicted_production);
      setResult(data.predicted_production);
      setGraphData([
        { name: 'Area (Ha)', value: area },
        { name: 'Production (Qtls)', value: production },
        { name: 'Yield (Qtls/Ha)', value: parseFloat((production / area).toFixed(2)) }
      ]);
      resultRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error(err);
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
                Predict
              </button>
            </form>
          </motion.div>
        </div>

        {/* Chart */}
        {graphData.length > 0 && (
          <div className="col-md-7">
            <motion.div className="card shadow-lg border-0 rounded-4 bg-white p-4 mb-4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
              <h4 className="text-center text-primary mb-4">Production Overview</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={graphData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#0d6efd" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        )}
      </div>

      {/* Map */}
      <motion.div className="mt-4" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <h5 className="text-center text-secondary mb-3">📍 District Map</h5>
        <div className="rounded-4 overflow-hidden shadow-sm">
          <MapContainer center={mapInfo.center} zoom={mapInfo.zoom} style={{ height: '400px', width: '100%' }}>
            <ChangeMapCenter center={mapInfo.center} />
            <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {mapInfo.markers.map((marker, i) => (
              <Marker key={i} position={marker.position} icon={L.icon({ iconUrl: markerIconPng, shadowUrl: markerShadowPng })}>
                <Popup>{marker.label}<br />Lat: {marker.position[0].toFixed(4)}, Lon: {marker.position[1].toFixed(4)}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </motion.div>

      {/* Prediction Result */}
      {result && (
        <motion.div ref={resultRef} className="text-center mt-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div id="pdfContent" className="card bg-white border-0 shadow-sm rounded-4 p-4 mx-auto mb-3" style={{ maxWidth: '500px' }}>
            <h4 className="text-primary">Prediction Report</h4>
            <p><strong>District:</strong> {formData.District_Name}</p>
            <p><strong>Crop:</strong> {formData.Crop}</p>
            <p><strong>Season:</strong> {formData.Season_Encoded}</p>
            <p><strong>Soil Quality:</strong> {formData.Soil_Quality_Encoded}</p>
            <p><strong>Rainfall:</strong> {formData.Rainfall} mm</p>
            <p><strong>Area:</strong> {formData.Area} Hectares</p>
            <hr />
            <h5 className="text-success fw-bold display-6">{result} Quintals</h5>
          </div>
          <button onClick={downloadPDF} className="btn btn-success shadow-sm fw-semibold">Download PDF</button>
        </motion.div>
      )}
    </div>
  );
};

export default PredictForm;

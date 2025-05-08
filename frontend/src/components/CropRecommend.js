import React, { useState } from 'react';
import { motion } from 'framer-motion';

function CropRecommend() {
  const [formData, setFormData] = useState({
    Nitrogen: '', Phosporus: '', Potassium: '', Temperature: '', Humidity: '', pH: '', Rainfall: ''
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/recommend_crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      setResult(data.recommended_crop);
    } catch (error) {
      console.error(error);
      setResult('Something went wrong while predicting crop.');
    }
  };

  return (
    <div className="container py-5 bg-body-secondary min-vh-100">
      <motion.div
        className="text-center mb-5"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-success fw-bold">🌱 Best Crop Recommendation</h2>
        <p className="text-muted">Enter soil and climate values to find the most suitable crop for your farm.</p>
      </motion.div>

      <div className="row justify-content-center">
        <motion.div
          className="col-lg-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="card shadow-lg border-0 rounded-4 bg-light p-4">
            <form onSubmit={handleSubmit} className="row g-4">
              {['Nitrogen', 'Phosporus', 'Potassium', 'Temperature', 'Humidity', 'pH', 'Rainfall'].map((field) => (
                <div className="col-md-6" key={field}>
                  <label htmlFor={field} className="form-label fw-semibold">
                    {field}
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id={field}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}
              <div className="col-12 text-center">
                <button type="submit" className="btn btn-success px-4 fw-bold shadow-sm">
                  🌾 Get Recommendation
                </button>
              </div>
            </form>

            {result && (
              <motion.div
                className="alert alert-success mt-4 text-center fw-semibold fs-5 rounded-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Recommended Crop: <span className="text-dark">{result}</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default CropRecommend;

import React from 'react';

const AboutUs = () => {
  return (
    <div className="container mt-5 p-4 rounded shadow-lg" style={{ background: 'linear-gradient(to right, #e3f2fd, #f1f8e9)' }}>
      {/* Header */}
      <h2 className="text-center mb-5 fw-bold" style={{ color: '#2e7d32' }}>
        <i className="fas fa-leaf me-2"></i>About Us
      </h2>

      {/* Welcome */}
      <div className="text-center mb-4">
        <p className="lead">
          🌾 Welcome to <span className="fw-bold text-success">Maharashtra Bhoomi</span>!<br />
          Helping farmers thrive with smart, data-powered crop predictions.
        </p>
      </div>

      {/* Mission */}
      <div className="card mb-4 border-0 shadow" style={{ background: '#fff8e1' }}>
        <div className="card-body">
          <h4 className="text-warning mb-3"><i className="fas fa-bullseye me-2"></i>Our Mission</h4>
          <p>
            Empowering farmers with accurate predictions to improve harvests, reduce risks, and ensure agricultural success.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="card mb-4 border-0 shadow" style={{ background: '#e8f5e9' }}>
        <div className="card-body">
          <h4 className="text-success mb-3"><i className="fas fa-seedling me-2"></i>What We Offer</h4>
          <ul className="list-unstyled">
            <li><span className="badge bg-success me-2">✔</span>Data-based crop yield predictions</li>
            <li><span className="badge bg-success me-2">✔</span>Real-time insights for smart farming</li>
            <li><span className="badge bg-success me-2">✔</span>User-friendly platform for all ages</li>
            <li><span className="badge bg-success me-2">✔</span>Deep environmental analysis</li>
          </ul>
        </div>
      </div>

      {/* Future Features */}
      <div className="card mb-4 border-0 shadow" style={{ background: '#ede7f6' }}>
        <div className="card-body">
          <h4 className="text-primary mb-3"><i className="fas fa-lightbulb me-2"></i>What's Coming Next?</h4>
          <ul className="list-unstyled">
            <li><i className="fas fa-leaf text-primary me-2"></i>Personalized crop recommendations</li>
            <li><i className="fas fa-map text-primary me-2"></i>District-wise analytics</li>
            <li><i className="fas fa-cloud-sun-rain text-primary me-2"></i>Live weather & soil data</li>
            <li><i className="fas fa-bell text-primary me-2"></i>Instant farming alerts</li>
          </ul>
        </div>
      </div>

      {/* Contact Section */}
      <div className="card text-center border-0 shadow" style={{ background: '#fce4ec' }}>
        <div className="card-body">
          <h4 className="text-danger mb-3"><i className="fas fa-envelope me-2"></i>Contact Us</h4>
          <p>Have feedback or a question? Reach out to us!</p>
          <p><strong>Email:</strong> <a href="mailto:support@maharathrabhoomi.com" className="text-danger">support@maharathrabhoomi.com</a></p>
          <p><strong>Phone:</strong> <a href="tel:+917499657836" className="text-danger">+91 7499657836</a></p>
          <a href="/contact" className="btn btn-danger mt-2">Send Message</a>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

import React from 'react';

const ContactUs = () => {
    return (
        <div
            className="container my-5 p-4 rounded shadow"
            style={{
                background: 'linear-gradient(135deg, #f3f9f4, #e8f5e9)',
                border: '1px solid #d0e0d6',
            }}
        >
            {/* Header */}
            <div className="text-center mb-5">
                <h2 className="fw-bold text-success"><i className="fas fa-phone-alt me-2"></i>Contact Us</h2>
                <p className="text-muted">We would love to hear from you! Drop a message for queries, suggestions, or support.</p>
            </div>

            {/* Contact Info */}
            <div className="row justify-content-center mb-5">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm" style={{ backgroundColor: '#f9fbe7' }}>
                        <div className="card-body">
                            <h5 className="card-title text-success mb-4 text-center"><i className="fas fa-address-book me-2"></i>Our Contact Details</h5>
                            <p className="mb-3">
                                <i className="fas fa-envelope text-success me-2"></i>
                                <strong>Email:</strong>{' '}
                                <a href="mailto:support@maharashtrabhoomi.com" className="text-success text-decoration-none">
                                    support@maharashtrabhoomi.com
                                </a>
                            </p>
                            <p>
                                <i className="fas fa-phone text-success me-2"></i>
                                <strong>Phone:</strong>{' '}
                                <a href="tel:+917499657836" className="text-success text-decoration-none">
                                    +91 7499657836
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Form */}
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm" style={{ backgroundColor: '#f1f8e9' }}>
                        <div className="card-body">
                            <h5 className="text-center text-success mb-4"><i className="fas fa-paper-plane me-2"></i>Send Us a Message</h5>
                            <form>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="form-control"
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="form-control"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="message" className="form-label">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="5"
                                        className="form-control"
                                        placeholder="Write your message here..."
                                        required
                                    ></textarea>
                                </div>
                                <div className="d-grid">
                                    <button type="submit" className="btn btn-success btn-lg">
                                        <i className="fas fa-paper-plane me-2"></i>Send Message
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;

import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo1.jpg';
import './Navbar.css'; // Make sure this file exists

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm py-3">
      <div className="container">
        {/* Brand */}
        <NavLink className="navbar-brand d-flex align-items-center" to="/">
          <img
            src={logo}
            alt="Logo"
            width="45"
            height="45"
            className="rounded-circle me-2"
            style={{ objectFit: 'cover', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          />
          <span className="fw-bold fs-4 text-success">Maharashtra Bhoomi</span>
        </NavLink>

        {/* Mobile Toggler */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center gap-lg-3 gap-2">
            <li className="nav-item">
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  'nav-link fw-semibold px-2' + (isActive ? ' active-nav' : ' text-dark')
                }
              >
                About Us
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  'nav-link fw-semibold px-2' + (isActive ? ' active-nav' : ' text-dark')
                }
              >
                Contact Us
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/predict" className="btn btn-outline-success fw-semibold">
                Predict
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/crop-recommend" className="btn btn-success fw-semibold text-white">
                Crop Recommend
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

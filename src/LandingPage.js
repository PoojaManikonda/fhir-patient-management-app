// src/LandingPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="landing-bg">
      <div className="frosted-box">
        <h1 className="main-title">FHIR Patient Management</h1>
        <p className="subtitle">Please select a section below:</p>
        <div className="nav-buttons">
          <button className="feature-btn" onClick={() => navigate("/view")}>
            View Patients
          </button>
          <button className="feature-btn" onClick={() => navigate("/register")}>
            Add New Patient
          </button>
        </div>
        {/* Mini Search Section */}
        <div className="mini-search-frost">
          <h2 className="search-mini-title">Search Patient</h2>
          <form onSubmit={handleSearch}>
            <label className="search-mini-label" htmlFor="mini-search-input">
              Enter Patient Name / Phone Number:
            </label>
            <input
              id="mini-search-input"
              className="search-mini-input"
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Patient Name / Phone Number"
              autoComplete="off"
            />
            <button
              className="search-mini-btn"
              type="submit"
              disabled={!query.trim()}
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

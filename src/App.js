
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import PatientForm from "./PatientForm";
import ListPatients from "./ListPatients";
import SearchPatient from "./SearchPatient";

function BackHomeBtn() {
  const nav = useNavigate();
  return (
    <button
      style={{
        margin: "25px 0 20px 0",
        background: "#1976d2",
        color: "white",
        border: "none",
        borderRadius: "8px",
        padding: "10px 24px",
        fontWeight: "bold",
        cursor: "pointer",
      }}
      onClick={() => nav("/")}
    >
      Back to Home
    </button>
  );
}

function RegisterPage() {
  return (
    <div>
      <BackHomeBtn />
      <h2>Patient Registration</h2>
      <PatientForm />
    </div>
  );
}

function ViewPage() {
  return (
    <div>
      <BackHomeBtn />
      <ListPatients />
    </div>
  );
}

function SearchPage() {
  const [editPatient, setEditPatient] = useState(null);
  return (
    <div>
      <BackHomeBtn />
      <SearchPatient onEdit={setEditPatient} />
      {editPatient && (
        <PatientForm selectedPatient={editPatient} onSubmitSuccess={() => setEditPatient(null)} onCancel={() => setEditPatient(null)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/view" element={<ViewPage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </Router>
  );
}

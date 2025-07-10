import React, { useState, useEffect } from 'react';

const initialState = {
  id: undefined,
  given: '',
  family: '',
  gender: '',
  dob: '',
  phone: ''
};

const FHIR_BASE = 'https://fhir-bootcamp.medblocks.com/fhir'; 

function PatientForm({ onSubmitSuccess, selectedPatient, onCancel }) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Populate form 
  useEffect(() => {
    if (selectedPatient) {
      setForm({
        id: selectedPatient.id,
        given: selectedPatient.given || '',
        family: selectedPatient.family || '',
        gender: selectedPatient.gender || '',
        dob: selectedPatient.dob || '',
        phone: selectedPatient.phone || ''
      });
    } else {
      setForm(initialState);
    }
    setErrors({});
    setMessage('');
  }, [selectedPatient]);

  const validate = () => {
    let errs = {};
    if (!form.given.trim()) errs.given = 'Given name is required';
    if (!form.family.trim()) errs.family = 'Family name is required';
    if (!['male', 'female', 'other', 'unknown'].includes(form.gender))
      errs.gender = 'Gender must be male, female, other, or unknown';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dob)) errs.dob = 'Use yyyy-mm-dd format';
    else if (new Date(form.dob) > new Date()) errs.dob = 'Date cannot be in the future';
    if (!/^\+?\d{7,15}$/.test(form.phone)) errs.phone = 'Enter a valid phone number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setMessage('');

    const resource = {
      resourceType: "Patient",
      name: [
        {
          use: "official",
          family: form.family,
          given: [form.given]
        }
      ],
      telecom: [
        {
          system: "phone",
          value: form.phone,
          use: "mobile"
        }
      ],
      gender: form.gender,
      birthDate: form.dob,
      active: true
    };

    try {
      let response;
      if (form.id) {
        // Update existing patient
        response = await fetch(`${FHIR_BASE}/Patient/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/fhir+json' },
          body: JSON.stringify({ ...resource, id: form.id })
        });
      } else {
        // Create new patient
        response = await fetch(`${FHIR_BASE}/Patient`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/fhir+json' },
          body: JSON.stringify(resource)
        });
      }

      if (response.ok) {
        setMessage(form.id ? 'Patient updated successfully!' : 'Patient added successfully!');
        setForm(initialState);
        setErrors({});
        if (onSubmitSuccess) onSubmitSuccess();
      } else {
        const errJson = await response.json();
        setMessage('Failed: ' + (errJson.issue ? errJson.issue[0].diagnostics : 'Unknown error'));
      }
    } catch (err) {
      setMessage('Network error while saving patient.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete patient
  const handleDelete = async () => {
    if (!form.id) return;
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    setSubmitting(true);
    setMessage('');
    try {
      const response = await fetch(`${FHIR_BASE}/Patient/${form.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setMessage('Patient deleted successfully!');
        setForm(initialState);
        setErrors({});
        if (onSubmitSuccess) onSubmitSuccess();
      } else {
        const errJson = await response.json();
        setMessage('Failed to delete: ' + (errJson.issue ? errJson.issue[0].diagnostics : 'Unknown error'));
      }
    } catch (err) {
      setMessage('Network error while deleting patient.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
      <div>
        <label>Given Name:</label>
        <input
          name="given"
          value={form.given}
          onChange={handleChange}
          required
        />
        {errors.given && <div style={{ color: 'red' }}>{errors.given}</div>}
      </div>
      <div>
        <label>Family Name:</label>
        <input
          name="family"
          value={form.family}
          onChange={handleChange}
          required
        />
        {errors.family && <div style={{ color: 'red' }}>{errors.family}</div>}
      </div>
      <div>
        <label>Gender:</label>
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="unknown">Unknown</option>
        </select>
        {errors.gender && <div style={{ color: 'red' }}>{errors.gender}</div>}
      </div>
      <div>
        <label>Date of Birth:</label>
        <input
          name="dob"
          type="date"
          value={form.dob}
          onChange={handleChange}
          required
        />
        {errors.dob && <div style={{ color: 'red' }}>{errors.dob}</div>}
      </div>
      <div>
        <label>Phone Number:</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          required
        />
        {errors.phone && <div style={{ color: 'red' }}>{errors.phone}</div>}
      </div>
      <button type="submit" disabled={submitting}>
        {form.id ? 'Update Patient' : 'Add Patient'}
      </button>
      {form.id && (
        <>
          <button type="button" onClick={onCancel} style={{ marginLeft: 8 }}>Cancel</button>
          <button type="button" onClick={handleDelete} style={{ marginLeft: 8, color: "white", background: "red", border: "none", padding: "6px 12px", borderRadius: "4px" }}>
            Delete
          </button>
        </>
      )}
      {message && <div style={{ marginTop: 8, color: message.includes('success') ? 'green' : 'red' }}>{message}</div>}
    </form>
  );
}

export default PatientForm;

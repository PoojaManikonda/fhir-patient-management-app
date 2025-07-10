import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const FHIR_BASE = 'https://fhir-bootcamp.medblocks.com/fhir';

function SearchPatient({ onEdit }) {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get ?q= from URL, and search on first mount or whenever q changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    setQuery(q);
    if (q.trim()) {
      performSearch(q.trim());
    }
    // eslint-disable-next-line
  }, [location.search]);

  // Determine if the query is likely a phone number
  const isPhone = (q) => /^\+?\d{7,}$/.test(q);

  const performSearch = async (searchQuery) => {
    setError('');
    setLoading(true);
    setResults([]);

    let url = `${FHIR_BASE}/Patient?`;
    if (isPhone(searchQuery)) {
      url += `telecom=${encodeURIComponent(searchQuery)}`;
    } else {
      // FHIR spec: split on spaces for multiple name params
      const nameParts = searchQuery.split(/\s+/);
      url += nameParts.map(part => `name=${encodeURIComponent(part)}`).join('&');
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      const entries = data.entry || [];
      const patients = entries.map(entry => {
        const resource = entry.resource;
        const given = resource.name && resource.name[0] && resource.name[0].given
          ? resource.name[0].given.join(' ')
          : '';
        const family = resource.name && resource.name[0] && resource.name[0].family
          ? resource.name[0].family
          : '';
        return {
          id: resource.id,
          given,
          family,
          gender: resource.gender || '',
          dob: resource.birthDate || '',
          phone: (resource.telecom && resource.telecom.find(t => t.system === 'phone')) ? resource.telecom.find(t => t.system === 'phone').value : ''
        };
      });
      setResults(patients);
      if (patients.length === 0) setError('No patients found.');
    } catch {
      setError('Error searching patients.');
    }
    setLoading(false);
  };

  // Allow resubmitting another search
  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    performSearch(query.trim());
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <h2>Search Patients</h2>
      <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="text"
          placeholder="Enter name or phone number"
          value={query}
          onChange={e => setQuery(e.target.value)}
          required
        />
        <button type="submit" disabled={loading || !query.trim()}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {results.length > 0 && (
        <table style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Given Name</th>
              <th>Family Name</th>
              <th>Gender</th>
              <th>Date of Birth</th>
              <th>Phone</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {results.map(patient => (
              <tr key={patient.id}>
                <td>{patient.given || '-'}</td>
                <td>{patient.family || '-'}</td>
                <td>{patient.gender || '-'}</td>
                <td>{patient.dob || '-'}</td>
                <td>{patient.phone || '-'}</td>
                <td>
                  <button type="button" onClick={() => onEdit(patient)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SearchPatient;

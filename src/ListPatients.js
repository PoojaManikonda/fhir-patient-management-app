import React, { useEffect, useState } from "react";

const FHIR_BASE = "https://fhir-bootcamp.medblocks.com/fhir";

export default function ListPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${FHIR_BASE}/Patient?_count=20&_sort=-_lastUpdated`)
      .then((res) => res.json())
      .then((data) => {
        const entries = data.entry || [];
        const list = entries.map((entry) => {
          const resource = entry.resource;
          const given = resource.name && resource.name[0]?.given
            ? resource.name[0].given.join(" ")
            : "";
          const family = resource.name && resource.name[0]?.family
            ? resource.name[0].family
            : "";
          return {
            id: resource.id,
            given,
            family,
            gender: resource.gender || "",
            dob: resource.birthDate || "",
            phone:
              resource.telecom && resource.telecom.find((t) => t.system === "phone")
                ? resource.telecom.find((t) => t.system === "phone").value
                : "",
          };
        });
        setPatients(list);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load patients.");
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Patient List</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {!loading && patients.length === 0 && <div>No patients found.</div>}
      {!loading && patients.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Given Name</th>
              <th>Family Name</th>
              <th>Gender</th>
              <th>Date of Birth</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td>{p.given || "-"}</td>
                <td>{p.family || "-"}</td>
                <td>{p.gender || "-"}</td>
                <td>{p.dob || "-"}</td>
                <td>{p.phone || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

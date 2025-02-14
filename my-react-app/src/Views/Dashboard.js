import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, AlertCircle } from "lucide-react";
import './css/Dashboard.css';

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [employeesRes, batchesRes] = await Promise.all([
          axios.get("http://localhost:3001/employees"),
          axios.get("http://localhost:3001/batches"),
        ]);
        setEmployees(employeesRes.data);
        setBatches(batchesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="header">
          <h1 className="title">Admin Dashboard</h1>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle className="icon" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading">
            <Loader2 className="loader" />
          </div>
        ) : (
          <>
            <div className="stats">
              <div className="stat-card blue">
                <h3 className="stat-value">{employees.length}</h3>
                <p className="stat-label">Total Employees</p>
              </div>
              <div className="stat-card green">
                <h3 className="stat-value">{batches.length}</h3>
                <p className="stat-label">Total Batches</p>
              </div>
            </div>

            <div className="table-card">
              <h2 className="table-title">Employee Overview</h2>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length > 0 ? (
                      employees.map((employee) => (
                        <tr key={employee.employee_id}>
                          <td>{employee.first_name} {employee.last_name}</td>
                          <td>{employee.role}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2">No employees found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="table-card">
              <h2 className="table-title">Batch Overview</h2>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Batch Name</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.length > 0 ? (
                      batches.map((batch) => (
                        <tr key={batch.batch_id}>
                          <td>{batch.batch_name}</td>
                          <td>{batch.start_date}</td>
                          <td>{batch.end_date}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3">No batches found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

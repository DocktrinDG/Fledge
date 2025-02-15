import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/TrainerDashboard.css";
import Footer from "../../components/Footer";

const TrainerDashboard = () => {
  const [batches, setBatches] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3001/batches", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBatches(response.data);
      } catch (err) {
        console.error("Error fetching batches:", err);
        setError("Failed to load batch details.");
      }
    };

    fetchBatches();
  }, []);

  if (error) return <p>{error}</p>;
  if (!batches.length) return <p>Loading...</p>;

  return (
    <div className="trainer-dashboard">
      {/* Top Navigation Bar */}
      <header className="top-bar">
        <h1 className="dashboard-title">Trainer Dashboard</h1>
        <nav className="navigation">
          <a href="#" className="nav-link">Home</a>
          <a href="#" className="nav-link">Training Requests</a>
          <a href="#" className="nav-link">Reports</a>
          <input type="text" className="search-box" placeholder="Search in site" />
        </nav>
      </header>

      {/* Dashboard Content Grid */}
      <div className="dashboard-grid">

        {/* Batch Overview */}
        <div className="dashboard-card">
          <h2 className="card-title">Batch Overview</h2>
          <div className="batch-overview">
            {batches.map((batch) => (
              <div className="batch-item" key={batch.batch_id}>
                <span>{batch.batch_name}</span>
                <p>Start Date: {batch.start_date}</p>
                <p>End Date: {batch.end_date}</p>
                <button className="view-details-btn">View Details</button>
              </div>
            ))}
          </div>
        </div>

        {/* Training Requests */}
        <div className="dashboard-card">
          <h2 className="card-title">Training Requests</h2>
          <table className="training-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Training Program</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>John Doe</td>
                <td>JavaScript Basics</td>
                <td className="status pending">Pending</td>
              </tr>
              <tr>
                <td>Jane Smith</td>
                <td>React Advanced</td>
                <td className="status approved">Approved</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Feedback Reports */}
        <div className="dashboard-card">
          <h2 className="card-title">Feedback Reports</h2>
          <div className="placeholder-box">Feedback summary charts here.</div>
        </div>

        {/* Skill Insights */}
        <div className="dashboard-card">
          <h2 className="card-title">Skill Insights</h2>
          <div className="placeholder-box">AI-driven recommendations here.</div>
        </div>

        {/* Notifications */}
        <div className="dashboard-card">
          <h2 className="card-title">Notifications</h2>
          <ul className="notification-list">
            <li>Pending approvals for training requests</li>
            <li>Upcoming training sessions</li>
            <li>Feedback reminders</li>
          </ul>
        </div>

        {/* Reports & Analytics */}
        <div className="dashboard-card">
          <h2 className="card-title">Reports & Analytics</h2>
          <div className="placeholder-box">Interactive dashboards here.</div>
          <button className="download-btn">Download Reports</button>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default TrainerDashboard;

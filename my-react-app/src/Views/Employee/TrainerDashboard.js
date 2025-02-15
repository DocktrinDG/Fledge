import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/TrainerDashboard.css";
import Footer from "../../components/Footer";
import Chart from "../../components/Chart";  // Import Chart Component

const TrainerDashboard = () => {
  const [batches, setBatches] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [selectedTrainee, setSelectedTrainee] = useState("");
  const [selectedTraining, setSelectedTraining] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPerfornmanceModal, setPerformanceShowModal] = useState(false);
  const [file, setFile] = useState(null);
  const [showPerformanceAnalysisModal, setShowPerformanceAnalysisModal] = useState(false);
  const [chartData, setChartData] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("marksFile", file); // ✅ Key must match backend field name

    try {
      const response = await fetch("http://localhost:3001/upload-marks", {
        method: "POST",
        body: formData,
      });

      const result = await response.json(); // Get response message

      if (response.ok) {
        alert("Marks uploaded successfully!");
        setPerformanceShowModal(false);
        setFile(null);
      } else {
        console.error("Upload failed:", result.error);
        alert("Failed to upload marks: " + result.error);
      }
    } catch (error) {
      console.error("Error uploading marks:", error);
      alert("An error occurred while uploading.");
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchTrainings();
    fetchEnrollments();
    fetchTrainees();
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/employee-marks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Extract trainee names and marks
      const trainees = response.data.map((entry) => entry.first_name + " " + entry.last_name);
      const sqlMarks = response.data.map((entry) => entry.sql);
      const toscaMarks = response.data.map((entry) => entry.tosca);

      // Prepare chart data
      const data = {
        labels: trainees,
        datasets: [
          {
            label: "SQL",
            backgroundColor: "rgba(194, 116, 161, 0.5)",
            borderColor: "rgb(194, 116, 161)",
            borderWidth: 1,
            data: sqlMarks,
          },
          {
            label: "Tosca",
            backgroundColor: "rgba(71, 225, 167, 0.5)",
            borderColor: "rgb(71, 225, 167)",
            borderWidth: 1,
            data: toscaMarks,
          },
        ],
      };

      setChartData(data);
    } catch (error) {
      console.error("Error fetching performance data:", error);
    }
  };

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

  const fetchTrainings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/getAllTraining", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrainings(response.data);
    } catch (err) {
      console.error("Error fetching trainings:", err);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/enrollments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnrollments(response.data);
    } catch (err) {
      console.error("Error fetching enrollments:", err);
    }
  };

  const fetchTrainees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/employees/trainees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrainees(response.data);
    } catch (err) {
      console.error("Error fetching trainees:", err);
    }
  };

  const handleEnrollTrainee = async () => {
    if (!selectedTrainee || !selectedTraining) {
      alert("Please select a trainee and a training.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3001/enrollments",
        { employee_id: selectedTrainee, training_id: selectedTraining },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Trainee enrolled successfully!");
      setShowModal(false);
      fetchEnrollments();
    } catch (error) {
      console.error("Error enrolling trainee:", error);
      alert("Failed to enroll trainee.");
    }
  };

  if (error) return <p>{error}</p>;
  if (!batches.length) return <p>Loading...</p>;

  return (
    <div className="trainer-dashboard">
      {/* Top Navigation Bar */}
      <header className="top-bar">
        <h1 className="dashboard-title">Trainer Dashboard</h1>
        <nav className="navigation">
          <button className="nav-link" onClick={() => navigate("/trainer-dashboard")}>Home</button>
          <button className="nav-link" onClick={() => navigate("/trainer-dashboard/training")}>Training</button>
          <button className="nav-link">Reports</button>
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

        {/* Training Enrollments */}
        <div className="dashboard-card">
          <h2 className="card-title">Training</h2>
          <table className="training-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Training Program</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.length > 0 ? (
                enrollments.map((enrollment) => (
                  <tr key={enrollment.enrollment_id}>
                    <td>{enrollment.first_name} {enrollment.last_name}</td>
                    <td>{enrollment.training_name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No enrollments found.</td>
                </tr>
              )}
            </tbody>
          </table>
          <button className="enroll-button" onClick={() => setShowModal(true)}>Enroll</button>
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

        <div className="dashboard-card">
          <h2 className="card-title">Performance Marking</h2>
          <ul className="notification-list">
            <div className="button-group">
              <button className="upload-button" onClick={() => setPerformanceShowModal(true)}>Upload Marks</button>
              <button className="analysis-button" onClick={() => setShowPerformanceAnalysisModal(true)}>
                View Performance Analysis
              </button>
            </div>
          </ul>

          {/* Performance Analysis Modal */}
          {showPerformanceAnalysisModal && (
            <div className="modal-overlay">
              <div className="modal large-modal">
                {chartData ? <Chart chartData={chartData} /> : <p>Loading...</p>}
                <div className="modal-buttons">
                  <button className="cancel-button" onClick={() => setShowPerformanceAnalysisModal(false)}>Close</button>
                </div>
              </div>
            </div>
          )}

          {/* Upload Marks Modal */}
          {showPerfornmanceModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Upload Marks</h2>
                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
                <div className="modal-buttons">
                  <button className="confirm-button" onClick={handleUpload}>Upload</button>
                  <button className="cancel-button" onClick={() => setPerformanceShowModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reports & Analytics */}
        <div className="dashboard-card">
          <h2 className="card-title">Reports & Analytics</h2>
          <div className="placeholder-box">Interactive dashboards here.</div>
          <button className="download-btn">Download Reports</button>
        </div>

      </div>

      {/* Enroll Trainee Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Enroll Trainee</h2>
            <label>Select Trainee:</label>
            <select value={selectedTrainee} onChange={(e) => setSelectedTrainee(e.target.value)}>
              <option value="">Select a Trainee</option>
              {trainees.map((trainee) => (
                <option key={trainee.employee_id} value={trainee.employee_id}>
                  {trainee.first_name} {trainee.last_name}
                </option>
              ))}
            </select>

            <label>Select Training:</label>
            <select value={selectedTraining} onChange={(e) => setSelectedTraining(e.target.value)}>
              <option value="">Select a Training</option>
              {trainings.map((training) => (
                <option key={training.training_id} value={training.training_id}>
                  {training.training_name}
                </option>
              ))}
            </select>

            <div className="modal-buttons">
              <button className="confirm-button" onClick={handleEnrollTrainee}>Enroll</button>
              <button className="cancel-button" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default TrainerDashboard;

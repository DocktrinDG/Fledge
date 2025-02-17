import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/TrainerDashboard.css";
import Footer from "../../components/Footer";
import Chart from "../../components/Chart";  // Import Chart Component
import { DirectLine } from 'botframework-directlinejs';
import html2canvas from "html2canvas"; // Import html2canvas to capture the chart

const TrainerDashboard = () => {
  // AI-Agent Variables
  const [directLine, setDirectLine] = useState(null);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [messages, setMessages] = useState([]); // For storing conversation messages

  const [batches, setBatches] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [selectedTrainee, setSelectedTrainee] = useState("");
  const [selectedTraining, setSelectedTraining] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPerformanceModal, setPerformanceShowModal] = useState(false);
  const [file, setFile] = useState(null);
  const [showPerformanceAnalysisModal, setShowPerformanceAnalysisModal] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [recommendedTrainee, setRecommendedTrainee] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const chartRef = useRef(null); // Create a ref to access the chart

  useEffect(() => {
    fetchToken();
    fetchBatches();
    fetchTrainings();
    fetchEnrollments();
    fetchTrainees();
    fetchPerformanceData();
    fetchProjects();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleViewDetails = (batch) => {
    setSelectedBatch(batch); // Set the selected batch
    setShowBatchModal(true); // Show the modal
  };

  // Fetch Projects
  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Recommend Trainee for Selected Project
  const handleRecommendTrainee = async () => {
    if (!selectedProject || !selectedSubject) {
      alert("Please select both project and subject.");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        "http://localhost:3001/recommend-trainee",
        { project_id: selectedProject, subject_name: selectedSubject },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecommendedTrainee(response.data);
    } catch (error) {
      console.error("Error recommending trainee:", error);
      alert("Failed to fetch recommendation.");
    }
  };

  // Allocate Trainee to Project
  const handleProjectAllocation = async () => {
    if (!selectedProject || !recommendedTrainee) {
      alert("Please select a project and a trainee first.");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        "http://localhost:3001/allocate-to-project",
        { employee_id: recommendedTrainee.employee_id, project_id: selectedProject },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
    } catch (error) {
      console.error("Error allocating employee to project:", error);
      alert(error.response?.data?.error || "Failed to allocate employee.");
    }
  };

  // Handle File Upload for Marks
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("marksFile", file);

    try {
      const response = await fetch("http://localhost:3001/upload-marks", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Upload Response:", result);

      if (!result.trainees || result.trainees.length === 0) {
        console.error("No trainees found in response.");
        alert("No trainees found in uploaded file.");
        return;
      }

      // Iterate over trainees and store the email
      result.trainees.forEach((trainee) => {
        const prompt = `${trainee.name} has got ${trainee.tosca} in Tosca and ${trainee.sql} in SQL. Please provide a review based on their performance.`;

        // Set email and message, then send message
        setEmail(trainee.email); // Set the email before calling sendMessage
        setMessage(prompt); // Set the message prompt

        console.log("Email Set:", trainee.email); // Debugging
        console.log("AI Prompt:", prompt); // Debugging

        sendMessage(trainee.email, prompt); // Send the message
      });

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

  // Fetch Token
  const fetchToken = async () => {
    try {
      const response = await axios.get("http://localhost:3001/token");
      const token = response.data.token;
      const directLineInstance = new DirectLine({ token });
      setDirectLine(directLineInstance);

      directLineInstance.connectionStatus$.subscribe((status) => {
        if (status === 2) {
          setConversationId(directLineInstance.conversationId);
        }
      });

      directLineInstance.activity$.subscribe(async (activity) => {
        if (activity.type === "message" && activity.from.id !== "user") {
          setMessages((prevMessages) => [
            ...prevMessages,
            { from: "bot", text: activity.text },
          ]);

          if (email) {
            console.log("Sending Email To:", email);
            console.log("AI Response:", activity.text);

            try {
              const emailResponse = await axios.post(
                "http://localhost:3001/send-email",
                {
                  to: email,
                  subject: "SkillMatrix AI Performance Review",
                  message: activity.text, // AI-generated response
                }
              );
              console.log("Email Sent Successfully:", emailResponse.data);
            } catch (emailError) {
              console.error("Error Sending Email:", emailError);
            }
          } else {
            console.warn("No email set, skipping email send.");
          }
        }
      });
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  };

  // AI Agent Message
  const sendMessage = async (recipientEmail, aiPrompt) => {
    if (directLine && aiPrompt) {
      try {
        await directLine.postActivity({
          from: { id: 'user', name: 'User' },
          type: 'message',
          text: aiPrompt
        }).subscribe();
        console.log('Posted activity successfully.');
      } catch (error) {
        console.error("Error posting activity:", error);
        alert("Error posting activity.");
      }
    }
  };

  // Fetch Performance Data
  const fetchPerformanceData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/employee-marks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const trainees = response.data.map((entry) => entry.first_name + " " + entry.last_name);
      const sqlMarks = response.data.map((entry) => entry.sql);
      const toscaMarks = response.data.map((entry) => entry.tosca);

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

  // Fetch Batches, Trainings, Enrollments, and Trainees
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

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3001/logout", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Log Out Successfully");
      localStorage.removeItem("token");
      localStorage.removeItem("is_trainer");
      localStorage.removeItem("role");

      navigate("/");  // Redirect to login page
    } catch (err) {
      console.error("Error logging out:", err);
      alert("Logout failed. Try again.");
    }
  };

  //Download chart
  const handleDownload = () => {
    // Use html2canvas to capture the chart as an image
    if (chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = "performance-analysis-chart.png"; // File name
        link.href = canvas.toDataURL(); // Get the image data URL
        link.click(); // Trigger the download
      });
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
          <button className="nav-link" onClick={() => navigate("/ai-agent")}>Chat Bot</button>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
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
                <button className="view-details-btn" onClick={() => handleViewDetails(batch)}>
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Batch Details Modal */}
        {showBatchModal && selectedBatch && (
          <div className="modal-overlay">
            <div className="modal large-modal">
              <h2>Batch Details</h2>
              <p><strong>Batch Name:</strong> {selectedBatch.batch_name}</p>
              <p><strong>Start Date:</strong> {selectedBatch.start_date}</p>
              <p><strong>End Date:</strong> {selectedBatch.end_date}</p>
              <div className="modal-buttons">
                <button className="cancel-button" onClick={() => setShowBatchModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

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
        {/* <div className="dashboard-card">
          <h2 className="card-title">Feedback Reports</h2>
          <div className="placeholder-box">Feedback summary charts here.</div>
        </div> */}

        {/* Project Allocation Section */}
        <div className="dashboard-card">
          <h2 className="card-title">Project Allocation</h2>
          <button className="placeholder-button" onClick={() => setShowRecommendationModal(true)}>
            AI-driven recommendations here.
          </button>
        </div>

        <div className="dashboard-card">
          <h2 className="card-title">Performance Analysis</h2>
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
                  <button className="download-button" onClick={handleDownload}>
                    Download Chart
                  </button>
                  <button className="cancel-button" onClick={() => setShowPerformanceAnalysisModal(false)}>Close</button>
                </div>
              </div>
            </div>
          )}

          {/* Upload Marks Modal */}
          {showPerformanceModal && (
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

        {/* Reports & Analytics
        <div className="dashboard-card">
          <h2 className="card-title">Reports & Analytics</h2>
          <div className="placeholder-box">Interactive dashboards here.</div>
          <button className="download-btn">Download Reports</button>
        </div> */}

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

      {/* AI Recommendation Modal */}
      {showRecommendationModal && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <h2>Project Allocation</h2>
            <label>Select a Project:</label>
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
              <option value="">Choose a project</option>
              {projects.map((project) => (
                <option key={project.project_id} value={project.project_id}>
                  {project.project_name}
                </option>
              ))}
            </select>

            <label>Select a subject:</label>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              <option value="">Choose a subject</option>
              <option value="sql">SQL</option>
              <option value="tosca">TOSCA</option>
            </select>

            <button className="recommend-button" onClick={handleRecommendTrainee} disabled={!selectedProject || !selectedSubject}>
              Search
            </button>

            {recommendedTrainee ? (
              <div className="recommendation-result">
                <p><strong>Recommended Trainee:</strong> {recommendedTrainee.name}</p>
                <p><strong>Email:</strong> {recommendedTrainee.email}</p>
              </div>
            ) : (
              <p>No suitable trainee found.</p>
            )}

            <button className="allocate" onClick={handleProjectAllocation}>
              Allocate to project
            </button>

            <div className="modal-buttons">
              <button className="cancel-button" onClick={() => setShowRecommendationModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      <div className="spacer"/>
      <Footer />
    </div>
  );
};

export default TrainerDashboard;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/Training.css";
import Footer from "../components/Footer";

const Training = () => {
    const [trainings, setTrainings] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [trainingName, setTrainingName] = useState("");
    const [description, setDescription] = useState("");
    const [documentationUrl, setDocumentationUrl] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchTrainings();
    }, []);

    const fetchTrainings = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found in localStorage");
                return;
            }

            const response = await axios.get("http://localhost:3001/getAllTraining", {
                headers: { Authorization: `Bearer ${token}` },  // ✅ Include Bearer token
            });

            console.log("Trainings Fetched:", response.data); // ✅ Debugging
            setTrainings(response.data);
        } catch (error) {
            console.error("Error fetching trainings:", error.response ? error.response.data : error.message);
        }
    };


    const handleCreateTraining = async (e) => {
        e.preventDefault();

        if (!trainingName) {
            alert("Please enter a training name.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("User not authenticated.");
                return;
            }

            // Decode JWT Token to get employee_id
            const payload = JSON.parse(atob(token.split(".")[1]));
            const employeeId = payload.employee_id;  // Extracted from token

            const newTraining = {
                training_name: trainingName,
                description,
                documentation_url: documentationUrl,
                created_by: employeeId,  // ✅ Ensure correct employee ID
            };

            await axios.post("http://localhost:3001/trainings", newTraining, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("Training created successfully!");
            setShowModal(false);
            fetchTrainings();
        } catch (error) {
            console.error("Error creating training:", error.response ? error.response.data : error.message);
            alert("Failed to create training.");
        }
    };

    const handleDeleteTraining = async (id) => {
        if (!window.confirm("Are you sure you want to delete this training?")) return;

        try {
            const token = localStorage.getItem("token");

            await axios.delete(`http://localhost:3001/trainings/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("Training deleted successfully!");
            fetchTrainings(); // Refresh training list
        } catch (error) {
            console.error("Error deleting training:", error.response ? error.response.data : error.message);
            alert("Failed to delete training.");
        }
    };


    return (
        <div className="trainer-page">
            {/* 🟢 Top Bar */}
            <header className="top-bar">
                <h1 className="dashboard-title">Trainer Dashboard</h1>
                <nav className="navigation">
                    <button className="nav-link" onClick={() => navigate('/trainer-dashboard')}>Home</button>
                    <button className="nav-link">Training</button>
                    <button className="nav-link">Reports</button>
                </nav>
            </header>

            {/* 🟢 Training List */}
            <div className="container">
                <div className="header">
                    <h2>All Trainings</h2>
                    <button className="add-training-button" onClick={() => setShowModal(true)}>+ Add Training</button>
                </div>

                {trainings.length > 0 ? (
                    <table className="training-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Training Name</th>
                                <th>Description</th>
                                <th>Document URL</th>
                                <th>Created By</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trainings.map((training) => (
                                <tr key={training.training_id}>
                                    <td>{training.training_id}</td>
                                    <td>{training.training_name}</td>
                                    <td>{training.description || "N/A"}</td>
                                    <td>
                                        {training.documentation_url ? (
                                            <a href={training.documentation_url} target="_blank" rel="noopener noreferrer">View</a>
                                        ) : "N/A"}
                                    </td>
                                    <td>{training.created_by}</td>
                                    <td>
                                        <button className="delete-button" onClick={() => handleDeleteTraining(training.training_id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-data">No trainings found.</p>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Create New Training</h2>
                        <form onSubmit={handleCreateTraining}>
                            <input type="text" placeholder="Training Name" value={trainingName} onChange={(e) => setTrainingName(e.target.value)} required />
                            <textarea rows={4} placeholder="Training Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                            <input type="url" placeholder="Document URL" value={documentationUrl} onChange={(e) => setDocumentationUrl(e.target.value)} />

                            <div className="modal-buttons">
                                <button type="submit" className="confirm-button">Create Training</button>
                                <button type="button" className="cancel-button" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Training;

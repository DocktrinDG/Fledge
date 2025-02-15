import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer"
import "./css/Batch.css";

const Batch = () => {
    const [batches, setBatches] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [batchName, setBatchName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [trainees, setTrainees] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [selectedTrainees, setSelectedTrainees] = useState([]);
    const [selectedTrainers, setSelectedTrainers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBatches();
        fetchTraineesAndTrainers();
    }, []);

    const fetchBatches = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:3001/batches", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBatches(response.data);
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
    };

    const fetchTraineesAndTrainers = async () => {
        try {
            const token = localStorage.getItem("token");
            const [traineeRes, trainerRes] = await Promise.all([
                axios.get("http://localhost:3001/employees/trainees", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get("http://localhost:3001/employees/trainers", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);
            setTrainees(traineeRes.data);
            setTrainers(trainerRes.data);
        } catch (error) {
            console.error("Error fetching trainees or trainers:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const batchData = {
            batch_name: batchName,
            start_date: startDate,
            end_date: endDate,
            trainee_ids: selectedTrainees,
            trainer_ids: selectedTrainers,
        };

        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:3001/batches/full", batchData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("Batch created successfully!");
            setShowModal(false);
            fetchBatches();
        } catch (error) {
            console.error("Error creating batch:", error);
            alert("Failed to create batch.");
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this batch?");

        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:3001/batch/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Remove the deleted batch from state
            setBatches(batches.filter((batch) => batch.batch_id !== id));
            alert("Batch deleted successfully!");
        } catch (error) {
            console.error("Error deleting batch:", error);
            alert("Failed to delete batch. Please try again.");
        }
    };

    return (
        <div className="page">
            {/* 🟢 Top Bar */}
            <div className="top-bar">
                <div className="top-bar-child" />
                <div className="title">Batch Management</div>
                <div className="navigation">
                    <button className="tab" onClick={() => navigate('/admin/employee')}>Employees</button>
                    <button className="tab" >Batch</button>
                    <button className="tab" onClick={() => navigate('/admin/trainer')}>Trainers</button>
                    <button className="tab" onClick={() => navigate('/admin/trainee')}>Trainees</button>
                </div>
            </div>

            {/* 🟢 Batch List */}
            <div className="container">
                <div className="batch-header">
                    <h2>All Batches</h2>
                    <button className="add-batch-button" onClick={() => setShowModal(true)}>+ Add Batch</button>
                </div>

                {batches.length > 0 ? (
                    <table className="batch-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Batch Name</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batches.map((batch) => (
                                <tr key={batch.batch_id}>
                                    <td>{batch.batch_id}</td>
                                    <td>{batch.batch_name}</td>
                                    <td>{batch.start_date}</td>
                                    <td>{batch.end_date}</td>
                                    <td>
                                        <button className="delete-button" onClick={() => handleDelete(batch.batch_id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="no-data-container">
                        <p className="no-data">No batches found.</p>
                        <button className="add-batch-button" onClick={() => setShowModal(true)}>Add Batch</button>
                    </div>
                )}
            </div>

            {/* 🟢 Add Batch Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Create New Batch</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" placeholder="Batch Name" value={batchName} onChange={(e) => setBatchName(e.target.value)} required />
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />

                            <label>Select Trainees:</label>
                            <select multiple onChange={(e) => setSelectedTrainees([...e.target.selectedOptions].map(o => o.value))}>
                                {trainees.map(trainee => (
                                    <option key={trainee.employee_id} value={trainee.employee_id}>
                                        {trainee.first_name} {trainee.last_name}
                                    </option>
                                ))}
                            </select>

                            <label>Select Trainers:</label>
                            <select multiple onChange={(e) => setSelectedTrainers([...e.target.selectedOptions].map(o => o.value))}>
                                {trainers.map(trainer => (
                                    <option key={trainer.employee_id} value={trainer.employee_id}>
                                        {trainer.first_name} {trainer.last_name}
                                    </option>
                                ))}
                            </select>

                            <button type="submit" className="submit-button">Create Batch</button>
                            <button type="button" className="close-modal" onClick={() => setShowModal(false)}>Close</button>
                        </form>
                    </div>
                </div>
            )}
			<Footer />

        </div>
    );
};

export default Batch;

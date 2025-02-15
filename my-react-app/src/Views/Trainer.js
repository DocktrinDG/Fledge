import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/Trainer.css";

const Trainer = () => {
    const [trainers, setTrainers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchTrainers();
        fetchEmployees();
    }, []);

    const fetchTrainers = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:3001/employees/trainers", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTrainers(response.data);
        } catch (error) {
            console.error("Error fetching trainers:", error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:3001/all-employee", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const nonTrainers = response.data.filter(emp => emp.is_trainer === 0);
            setEmployees(nonTrainers);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const handleRemoveTrainer = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to remove this trainer?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:3001/employee/${id}/remove-trainer`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setTrainers(trainers.filter((trainer) => trainer.employee_id !== id));
            fetchEmployees(); // Refresh list after removal
            alert("Trainer removed successfully!");
        } catch (error) {
            console.error("Error removing trainer:", error);
            alert("Failed to remove trainer.");
        }
    };

    const handleAddTrainer = async () => {
        if (!selectedEmployee) {
            alert("Please select an employee.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:3001/employee/${selectedEmployee}/make-trainer`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("Employee is now a Trainer!");
            setShowModal(false);
            fetchTrainers();
            fetchEmployees();
        } catch (error) {
            console.error("Error making trainer:", error);
            alert("Failed to promote employee.");
        }
    };

    return (
        <div className="page">
            {/* 🟢 Top Bar */}
            <div className="top-bar">
                <div className="top-bar-child" />
                <div className="title">Trainer Management</div>
                <div className="navigation">
                    <button className="tab" onClick={() => navigate('/admin/employee')}>Employees</button>
                    <button className="tab" onClick={() => navigate('/admin/batch')}>Batch</button>
                    <button className="tab">Trainers</button>
                    <button className="tab" onClick={() => navigate('/admin/trainee')}>Trainees</button>
                </div>
            </div>

            {/* 🟢 Trainer List */}
            <div className="container">
                <div className="header">
                    <h2>All Trainers</h2>
                    <button className="add-trainer-button" onClick={() => setShowModal(true)}>+ Add Trainer</button>
                </div>

                {trainers.length > 0 ? (
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Is Trainer</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trainers.map((trainer) => (
                                <tr key={trainer.employee_id}>
                                    <td>{trainer.employee_id}</td>
                                    <td>{trainer.first_name} {trainer.last_name}</td>
                                    <td>{trainer.email}</td>
                                    <td>{trainer.role}</td>
                                    <td>{trainer.is_trainer === 1 ? "Yes" : "No"}</td>
                                    <td>
                                        <button className="delete-button" onClick={() => handleRemoveTrainer(trainer.employee_id)}>
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-data">No trainers found.</p>
                )}
            </div>

            {/* 🟢 Add Trainer Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Promote Employee to Trainer</h2>
                        <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                            <option value="">Select an Employee</option>
                            {employees.map((emp) => (
                                <option key={emp.employee_id} value={emp.employee_id}>
                                    {emp.first_name} {emp.last_name} ({emp.role})
                                </option>
                            ))}
                        </select>
                        <button className="submit-button" onClick={handleAddTrainer}>Make Trainer</button>
                        <button className="close-modal" onClick={() => setShowModal(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Trainer;

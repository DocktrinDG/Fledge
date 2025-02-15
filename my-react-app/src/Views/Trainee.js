import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/Trainee.css";
import Footer from "../components/Footer";

const Trainee = () => {
    const [trainees, setTrainees] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchTrainees();
        fetchEmployees();
    }, []);

    const fetchTrainees = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:3001/employees/trainees", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTrainees(response.data);
        } catch (error) {
            console.error("Error fetching trainees:", error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:3001/all-employee", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const nonTrainees = response.data.filter(emp => emp.is_trainee === 0);
            setEmployees(nonTrainees);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const handleRemoveTrainee = async (id) => {
        if (!window.confirm("Are you sure you want to remove this trainee?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:3001/employee/${id}/remove-trainee`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setTrainees(trainees.filter((trainee) => trainee.employee_id !== id));
            fetchEmployees(); // Refresh list after removal
            alert("Trainee removed successfully!");
        } catch (error) {
            console.error("Error removing trainee:", error);
            alert("Failed to remove trainee.");
        }
    };

    const handleAddTrainee = async () => {
        if (!selectedEmployee) {
            alert("Please select an employee.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:3001/employee/${selectedEmployee}/make-trainee`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("Employee is now a Trainee!");
            setShowModal(false);
            fetchTrainees();
            fetchEmployees();
        } catch (error) {
            console.error("Error making trainee:", error);
            alert("Failed to promote employee.");
        }
    };

    return (
        <div className="trainee-page">
            {/* 🟢 Top Bar */}
            <div className="top-bar">
                <div className="top-bar-child" />
                <h1 className="title">Trainee Management</h1>
                <div className="navigation">
                    <button className="tab" onClick={() => navigate('/admin/employee')}>Employees</button>
                    <button className="tab" onClick={() => navigate('/admin/batch')}>Batch</button>
                    <button className="tab" onClick={() => navigate('/admin/trainer')}>Trainers</button>
                    <button className="tab active">Trainees</button>
                </div>
            </div>

            {/* 🟢 Trainee List */}
            <div className="container">
                <div className="header">
                    <h2>All Trainees</h2>
                    <button className="add-trainee-button" onClick={() => setShowModal(true)}>+ Add Trainee</button>
                </div>

                {trainees.length > 0 ? (
                    <table className="trainee-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Is Trainee</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trainees.map((trainee) => (
                                <tr key={trainee.employee_id}>
                                    <td>{trainee.employee_id}</td>
                                    <td>{trainee.first_name} {trainee.last_name}</td>
                                    <td>{trainee.email}</td>
                                    <td>{trainee.role}</td>
                                    <td>{trainee.is_trainee === 1 ? "Yes" : "No"}</td>
                                    <td>
                                        <button className="remove-button" onClick={() => handleRemoveTrainee(trainee.employee_id)}>
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-data">No trainees found.</p>
                )}
            </div>

            {/* 🟢 Add Trainee Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Promote Employee to Trainee</h2>
                        <select className="modal-select" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                            <option value="">Select an Employee</option>
                            {employees.map((emp) => (
                                <option key={emp.employee_id} value={emp.employee_id}>
                                    {emp.first_name} {emp.last_name} ({emp.role})
                                </option>
                            ))}
                        </select>
                        <div className="modal-buttons">
                            <button className="confirm-button" onClick={handleAddTrainee}>Make Trainee</button>
                            <button className="cancel-button" onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Trainee;

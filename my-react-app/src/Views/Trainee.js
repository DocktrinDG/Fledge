import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/Trainee.css";

const Trainee = () => {
    const [trainees, settrainees] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchtrainees();
        fetchEmployees();
    }, []);

    const fetchtrainees = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:3001/employees/trainees", {
                headers: { Authorization: `Bearer ${token}` },
            });
            settrainees(response.data);
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

            const nontrainees = response.data.filter(emp => emp.is_trainee === 0);
            setEmployees(nontrainees);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const handleRemovetrainee = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to remove this trainee?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:3001/employee/${id}/remove-trainee`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            settrainees(trainees.filter((trainee) => trainee.employee_id !== id));
            fetchEmployees(); // Refresh list after removal
            alert("trainee removed successfully!");
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
            fetchtrainees();
            fetchEmployees();
        } catch (error) {
            console.error("Error making trainee:", error);
            alert("Failed to promote employee.");
        }
    };

    return (
        <div className="page">
            {/* 🟢 Top Bar */}
            <div className="top-bar">
                <div className="top-bar-child" />
                <div className="title">trainee Management</div>
                <div className="navigation">
                    <button className="tab" onClick={() => navigate('/admin/employee')}>Employees</button>
                    <button className="tab" onClick={() => navigate('/admin/batch')}>Batch</button>
                    <button className="tab" onClick={() => navigate('/admin/trainer')}>Trainers</button>
                    <button className="tab" >Trainees</button>
                </div>
            </div>

            {/* 🟢 trainee List */}
            <div className="container">
                <div className="header">
                    <h2>All Trainees</h2>
                    <button className="add-trainee-button" onClick={() => setShowModal(true)}>+ Add Trainee</button>
                </div>

                {trainees.length > 0 ? (
                    <table className="employee-table">
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
                                        <button className="delete-button" onClick={() => handleRemovetrainee(trainee.employee_id)}>
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

            {/* 🟢 Add trainee Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Promote Employee to trainee</h2>
                        <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                            <option value="">Select an Employee</option>
                            {employees.map((emp) => (
                                <option key={emp.employee_id} value={emp.employee_id}>
                                    {emp.first_name} {emp.last_name} ({emp.role})
                                </option>
                            ))}
                        </select>
                        <button className="submit-button" onClick={handleAddTrainee}>Make Trainee</button>
                        <button className="close-modal" onClick={() => setShowModal(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Trainee;

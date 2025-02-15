import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/Dashboard.css";

const ViewAllEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/all-employee", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this employee?");

    if (!confirmDelete) return; // Stop if user cancels

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3001/employee/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the deleted employee from state
      setEmployees(employees.filter((emp) => emp.employee_id !== id));
      alert("Employee deleted successfully!");
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Failed to delete employee. Please try again.");
    }
  };

  return (
    <div className="page">
      {/* 🟢 Top Bar */}
      <div className="top-bar">
        <div className="top-bar-child" />
        <div className="title">View Employees</div>
        <div className="navigation">
          <button className="tab">Employees</button>
          <button className="tab" onClick={()=>navigate('/admin/batch')}>Batch</button>
          <button className="tab" onClick={()=>navigate('/admin/trainee')}>Trainers</button>
          <button className="tab" onClick={()=>navigate('/admin/trainer')}>Trainees</button>
        </div>
      </div>

      {/* 🟢 Employee List */}
      <div className="container">
        <table className="employee-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th> {/* New column for actions */}
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp.employee_id}>
                  <td>{emp.employee_id}</td>
                  <td>{emp.first_name} {emp.last_name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.role}</td>
                  <td>
                    <button className="delete-button" onClick={() => handleDelete(emp.employee_id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">No employees found.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 🟢 Back Button */}
        <button className="back-button" onClick={() => navigate("/admin")}>
          Back to Admin
        </button>
      </div>
    </div>
  );
};

export default ViewAllEmployees;

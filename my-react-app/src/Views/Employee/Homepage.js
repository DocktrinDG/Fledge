import "../css/HomepageStyles.css";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  // ✅ Import useNavigate for redirection
import Chart from "../../components/Chart";

const EmployeeProfile = () => {
    const [employee, setEmployee] = useState(null);
    const [error, setError] = useState("");
    const [certifications, setCertifications] = useState([]);
    const [showCertModal, setShowCertModal] = useState(false);
    const [chartData, setChartData] = useState(null);
    const navigate = useNavigate();  // ✅ Hook for redirection

    const [newCert, setNewCert] = useState({
        certification_name: "",
        issued_by: "",
        issue_date: "",
        expiry_date: "",
    });

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:3001/employee", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEmployee(response.data);
                fetchCertifications();
            } catch (err) {
                setError("Failed to load employee details.");
            }
        };
        fetchEmployee();
    }, []);

    useEffect(() => {
        if (employee) fetchPerformance();
    }, [employee]);

    const fetchCertifications = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:3001/employee/certifications", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCertifications(response.data);
        } catch (err) {
            console.error("Error fetching certifications:", err);
        }
    };

    const handleAddCertificate = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:3001/employee/certifications", newCert, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Certificate added successfully!");
            setNewCert({ certification_name: "", issued_by: "", issue_date: "", expiry_date: "" });
            setShowCertModal(false);
            fetchCertifications();
        } catch (err) {
            alert("Failed to add certificate.");
        }
    };

    const fetchPerformance = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:3001/employee/performance", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = {
                labels: ["SQL", "Tosca"],
                datasets: [
                    {
                        label: "Performance Scores",
                        backgroundColor: ["rgba(194, 116, 161, 0.5)", "rgba(71, 225, 167, 0.5)"],
                        borderColor: ["rgb(194, 116, 161)", "rgb(71, 225, 167)"],
                        borderWidth: 1,
                        data: [response.data[0].sql, response.data[0].tosca],
                    },
                ],
            };
            setChartData(data);
        } catch (err) {
            console.error("Error fetching performance:", err);
        }
    };

    // ✅ Logout Function (Calls Backend & Clears Token)
    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:3001/logout", {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            localStorage.removeItem("token");  // ✅ Remove token from localStorage
            navigate("/");  // ✅ Redirect to login page
        } catch (err) {
            console.error("Error logging out:", err);
            alert("Logout failed. Try again.");
        }
    };

    if (error) return <p>{error}</p>;
    if (!employee) return <p>Loading...</p>;

    return (
        <div className="employee-profile">
            {/* ✅ Top Bar with Logout Button */}
            <div className="top-bar">
                <div className="title">Employee Profile</div>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
            </div>

            {/* ✅ Certifications Section */}
            <div className="section">
                <h2 className="section-title">Certifications</h2>
                <div className="certifications-section">
                    <div className="cert-header">
                        <h3>Completed Certifications</h3>
                        <button className="primary-button" onClick={() => setShowCertModal(true)}>+ Add Certificate</button>
                    </div>

                    {certifications.length > 0 ? (
                        <div className="table-container">
                            <table className="certifications-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Certification Name</th>
                                        <th>Issued By</th>
                                        <th>Issue Date</th>
                                        <th>Expiry Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {certifications.map((cert, index) => (
                                        <tr key={cert.cert_id}>
                                            <td>{index + 1}</td>
                                            <td>{cert.certification_name}</td>
                                            <td>{cert.issued_by}</td>
                                            <td>{cert.issue_date}</td>
                                            <td>{cert.expiry_date || "N/A"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="no-data-text">No certifications found.</p>
                    )}
                </div>
            </div>

            {/* ✅ Performance Section */}
            <div className="section">
                <h2 className="section-title">Performance</h2>
                <div className="certifications-section">
                    {chartData ? <Chart chartData={chartData} /> : <p>Loading Performance Data...</p>}
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;

import "../css/HomepageStyles.css";
import axios from "axios";
import React, { useState, useEffect } from "react";
import Chart from "../../components/Chart";

const EmployeeProfile = () => {
	const [employee, setEmployee] = useState(null);
	const [error, setError] = useState("");
	const [ongoingTrainings, setOngoingTrainings] = useState([]);
	const [certifications, setCertifications] = useState([]);
	const [showCertModal, setShowCertModal] = useState(false);
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
				if (response.data.is_trainee === 1) {
					fetchOngoingTrainings();
				}
				fetchCertifications();
			} catch (err) {
				console.error("Error fetching employee:", err);
				setError("Failed to load employee details.");
			}
		};
		fetchEmployee();
	}, []);

	const fetchOngoingTrainings = async () => {
		try {
			const token = localStorage.getItem("token");
			const response = await axios.get("http://localhost:3001/employee/trainings", {
				headers: { Authorization: `Bearer ${token}` },
			});

			setOngoingTrainings(response.data);
		} catch (err) {
			console.error("Error fetching ongoing trainings:", err);
		}
	};

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
			const response = await axios.post(
				"http://localhost:3001/employee/certifications",
				newCert,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			if (response.status === 201) {
				alert("Certificate added successfully!");
				setShowCertModal(false);
				fetchCertifications();
			}
		} catch (err) {
			console.error("Error adding certificate:", err);
			alert("Failed to add certificate.");
		}
	};

	if (error) return <p>{error}</p>;
	if (!employee) return <p>Loading...</p>;

	return (
		<div className="employee-profile">
			{/* ✅ HEADER SECTION */}
			<div className="top-bar">
				<div className="top-bar-child" />
				<div className="title">Employee Profile</div>
				<div className="navigation">
				</div>
			</div>

			{/* ✅ TRAINING SECTION */}
			<div className="section">
				<h2 className="section-title">Certifications & Training</h2>

				{/* ✅ Certifications Table */}
				<div className="certifications-section">
					<div className="cert-header">
						<h3>Completed Certifications</h3>
						<button
							className="primary-button"
							onClick={() => setShowCertModal(true)}
						>
							+ Add Certificate
						</button>
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

			{/* ✅ ADD CERTIFICATION MODAL */}
			{showCertModal && (
				<div className="modal-overlay">
					<div className="modal">
						<h2>Add New Certificate</h2>
						<div className="input-group">
							<label>Certification Name</label>
							<input
								type="text"
								value={newCert.certification_name}
								onChange={(e) =>
									setNewCert({ ...newCert, certification_name: e.target.value })
								}
								required
							/>
						</div>
						<div className="input-group">
							<label>Issued By</label>
							<input
								type="text"
								value={newCert.issued_by}
								onChange={(e) =>
									setNewCert({ ...newCert, issued_by: e.target.value })
								}
								required
							/>
						</div>
						<div className="input-group">
							<label>Issue Date</label>
							<input
								type="date"
								value={newCert.issue_date}
								onChange={(e) =>
									setNewCert({ ...newCert, issue_date: e.target.value })
								}
								required
							/>
						</div>
						<div className="input-group">
							<label>Expiry Date</label>
							<input
								type="date"
								value={newCert.expiry_date}
								onChange={(e) =>
									setNewCert({ ...newCert, expiry_date: e.target.value })
								}
							/>
						</div>

						<div className="modal-buttons">
							<button className="primary-button" onClick={handleAddCertificate}>
								Add Certificate
							</button>
							<button
								className="secondary-button"
								onClick={() => setShowCertModal(false)}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default EmployeeProfile;

import React, { useState, useEffect } from "react";
import { uploadCertification } from "../services/api";
import axios from "axios";

const UploadCertification = () => {
    const [employeeId, setEmployeeId] = useState("");
    const [certificationName, setCertificationName] = useState("");
    const [issuedBy, setIssuedBy] = useState("");
    const [issueDate, setIssueDate] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [certFile, setCertFile] = useState(null);
    const [employees, setEmployees] = useState([]);

    // Fetch Employees List for Dropdown
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axios.get("http://localhost:3001/employees");
                setEmployees(response.data);
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };
        fetchEmployees();
    }, []);

    const handleFileChange = (e) => {
        setCertFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!certFile || !employeeId || !certificationName || !issuedBy || !issueDate) {
            alert("Please fill all fields and select a file.");
            return;
        }

        const formData = new FormData();
        formData.append("employee_id", employeeId);
        formData.append("certification_name", certificationName);
        formData.append("issued_by", issuedBy);
        formData.append("issue_date", issueDate);
        formData.append("expiry_date", expiryDate);
        formData.append("cert_file", certFile);

        try {
            await uploadCertification(formData);
            alert("Certification uploaded successfully!");
        } catch (error) {
            console.error("Error uploading certification:", error);
            alert("Failed to upload certification.");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
            <h2>Upload Certification</h2>
            <form onSubmit={handleSubmit}>
                {/* Employee Selection */}
                <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required>
                    <option value="">Select Employee</option>
                    {employees.map((employee) => (
                        <option key={employee.employee_id} value={employee.employee_id}>
                            {employee.first_name} {employee.last_name}
                        </option>
                    ))}
                </select>

                <input type="text" placeholder="Certification Name" value={certificationName} onChange={(e) => setCertificationName(e.target.value)} required />
                <input type="text" placeholder="Issued By" value={issuedBy} onChange={(e) => setIssuedBy(e.target.value)} required />
                <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
                <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                <input type="file" onChange={handleFileChange} required />
                <button type="submit">Upload Certification</button>
            </form>
        </div>
    );
};

export default UploadCertification;

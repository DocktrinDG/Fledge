import React, { useState, useEffect } from "react";
import axios from "axios";

const UploadDocument = () => {
    const [employeeId, setEmployeeId] = useState(""); // Store selected employee ID
    const [documentType, setDocumentType] = useState("");
    const [document, setDocument] = useState(null);
    const [employees, setEmployees] = useState([]); // List of employees

    // Fetch employees from API on component mount
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axios.get("http://localhost:3001/employees");
                setEmployees(response.data); // Set employees list from response
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };
        fetchEmployees();
    }, []);

    const handleFileChange = (e) => {
        setDocument(e.target.files[0]); // Set the selected file
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!document || !employeeId || !documentType) {
            alert("Please fill all fields and select a document.");
            return;
        }

        const formData = new FormData();
        formData.append("employee_id", employeeId);
        formData.append("document_type", documentType);
        formData.append("document", document);

        try {
            const response = await axios.post("http://localhost:3001/upload-document", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert("Document uploaded successfully!");
            console.log(response.data); // Log the response data for the uploaded document
        } catch (error) {
            console.error("Error uploading document:", error);
            alert("Failed to upload document.");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
            <h2>Upload Document</h2>
            <form onSubmit={handleSubmit}>
                {/* Employee selection dropdown */}
                <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required>
                    <option value="">Select Employee</option>
                    {employees.map((employee) => (
                        <option key={employee.employee_id} value={employee.employee_id}>
                            {employee.first_name} {employee.last_name}
                        </option>
                    ))}
                </select>

                {/* Document Type Selection */}
                <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} required>
                    <option value="">Select Document Type</option>
                    <option value="Marksheet">Marksheet</option>
                    <option value="Certification">Certification</option>
                    <option value="Other">Other</option>
                </select>

                {/* File Upload */}
                <input type="file" onChange={handleFileChange} required />
                <button type="submit">Upload Document</button>
            </form>
        </div>
    );
};

export default UploadDocument;

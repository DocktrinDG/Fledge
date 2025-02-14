import React, { useEffect, useState } from "react";
import { getDocuments } from "../services/api"; // Import API function

const Library = () => {
    const [documents, setDocuments] = useState([]);

    // Fetch documents on component load
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await getDocuments(); // Use API function
                setDocuments(response.data);
            } catch (error) {
                console.error("Error fetching documents:", error);
            }
        };
        fetchDocuments();
    }, []);

    return (
        <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
            <h2>📂 Document Library</h2>
            {documents.length === 0 ? (
                <p>No documents available.</p>
            ) : (
                <ul>
                    {documents.map((doc) => (
                        <li key={doc.document_id}>
                            <strong>{doc.document_type}</strong> - Uploaded by Employee ID: {doc.employee_id}
                            <br />
                            <a href={`http://localhost:3001/${doc.document_url}`} target="_blank" rel="noopener noreferrer">
                                📄 View Document
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Library;

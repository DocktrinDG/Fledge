import React, { useState, useEffect } from "react";
import { createTraining } from "../services/api";
import axios from "axios";

const CreateTraining = () => {
    const [trainingName, setTrainingName] = useState("");
    const [description, setDescription] = useState("");
    const [documentationUrl, setDocumentationUrl] = useState("");
    const [createdBy, setCreatedBy] = useState("");
    const [trainers, setTrainers] = useState([]);

    // ✅ Fetch Trainers for "Created By" Dropdown
    useEffect(() => {
        const fetchTrainers = async () => {
            try {
                const response = await axios.get("http://localhost:3001/employees");
                setTrainers(response.data);
            } catch (error) {
                console.error("Error fetching trainers:", error);
            }
        };
        fetchTrainers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!trainingName || !createdBy) {
            alert("Please enter a training name and select a trainer.");
            return;
        }

        const trainingData = {
            training_name: trainingName,
            description,
            documentation_url: documentationUrl,
            created_by: createdBy,
        };

        try {
            await createTraining(trainingData);
            alert("Training created successfully!");
            setTrainingName("");
            setDescription("");
            setDocumentationUrl("");
            setCreatedBy("");
        } catch (error) {
            console.error("Error creating training:", error);
            alert("Failed to create training.");
        }
    };

    return (
        <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
            <h2>Create New Training</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Training Name"
                    value={trainingName}
                    onChange={(e) => setTrainingName(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Documentation URL"
                    value={documentationUrl}
                    onChange={(e) => setDocumentationUrl(e.target.value)}
                />

                {/* ✅ Trainer Selection Dropdown */}
                <select value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} required>
                    <option value="">Select Trainer</option>
                    {trainers.map((trainer) => (
                        <option key={trainer.employee_id} value={trainer.employee_id}>
                            {trainer.first_name} {trainer.last_name} ({trainer.email})
                        </option>
                    ))}
                </select>

                <button type="submit">Create Training</button>
            </form>
        </div>
    );
};

export default CreateTraining;

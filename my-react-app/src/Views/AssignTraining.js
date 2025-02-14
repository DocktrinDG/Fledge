import React, { useState, useEffect } from "react";
import { assignTrainingToBatch, getBatchTrainings, getTrainingEnrollments, getTrainings } from "../services/api";
import axios from "axios";

const AssignTraining = () => {
    const [batchId, setBatchId] = useState("");
    const [trainingId, setTrainingId] = useState("");
    const [batches, setBatches] = useState([]);
    const [trainings, setTrainings] = useState([]);  // ✅ Store trainings list
    const [batchTrainings, setBatchTrainings] = useState([]);
    const [enrolledTrainees, setEnrolledTrainees] = useState([]);

    // Fetch batches on component load
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const response = await axios.get("http://localhost:3001/batches");
                setBatches(response.data);
            } catch (error) {
                console.error("Error fetching batches:", error);
            }
        };
        fetchBatches();
    }, []);

    // Fetch trainings on component load
    useEffect(() => {
        const fetchTrainings = async () => {
            try {
                const response = await getTrainings();  // Assuming API is ready to fetch trainings
                setTrainings(response.data);
            } catch (error) {
                console.error("Error fetching trainings:", error);
            }
        };
        fetchTrainings();
    }, []);

    const handleAssignTraining = async () => {
        try {
            await assignTrainingToBatch(batchId, trainingId);
            alert("Training assigned successfully!");
            fetchBatchTrainings();
        } catch (error) {
            console.error("Error assigning training:", error);
        }
    };

    const fetchBatchTrainings = async () => {
        try {
            const response = await getBatchTrainings(batchId);
            setBatchTrainings(response.data);
        } catch (error) {
            console.error("Error fetching batch trainings:", error);
        }
    };

    const fetchTrainingEnrollments = async () => {
        try {
            const response = await getTrainingEnrollments(trainingId);
            setEnrolledTrainees(response.data);
        } catch (error) {
            console.error("Error fetching enrollments:", error);
        }
    };

    return (
        <div>
            <h2>Assign Training to Batch</h2>

            {/* ✅ Dropdown to Select a Batch */}
            <select value={batchId} onChange={(e) => setBatchId(e.target.value)}>
                <option value="">Select a Batch</option>
                {batches.map((batch) => (
                    <option key={batch.batch_id} value={batch.batch_id}>
                        {batch.batch_name} ({batch.start_date} - {batch.end_date})
                    </option>
                ))}
            </select>

            {/* ✅ Dropdown to Select Training by Name */}
            <select value={trainingId} onChange={(e) => setTrainingId(e.target.value)} required>
                <option value="">Select Training</option>
                {trainings.map((training) => (
                    <option key={training.training_id} value={training.training_id}>
                        {training.training_name}
                    </option>
                ))}
            </select>

            <button onClick={handleAssignTraining}>Assign Training</button>

            <h3>Trainings Assigned to Batch</h3>
            <ul>
                {batchTrainings.map((training) => (
                    <li key={training.training_id}>
                        {training.training_name} - {training.description}
                    </li>
                ))}
            </ul>

            <h3>Enrolled Trainees for Selected Training</h3>
            <button onClick={fetchTrainingEnrollments}>View Enrolled Trainees</button>
            <ul>
                {enrolledTrainees.map((trainee) => (
                    <li key={trainee.enrollment_id}>
                        {trainee.first_name} {trainee.last_name} - {trainee.email} ({trainee.status})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AssignTraining;

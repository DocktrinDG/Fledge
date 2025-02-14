import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

// Create a new batch
export const createBatch = async (batchData) => {
  return await axios.post(`${API_BASE_URL}/batches`, batchData);
};

// Get list of trainees
export const getTrainees = async () => {
  return await axios.get(`${API_BASE_URL}/employees/trainees`);
};

// Get list of trainers
export const getTrainers = async () => {
  return await axios.get(`${API_BASE_URL}/employees/trainers`);
};

// Assign trainees to batch
export const assignTrainees = async (batchId, traineeIds) => {
  return await axios.post(`${API_BASE_URL}/batches/${batchId}/assign-trainees`, { trainee_ids: traineeIds });
};

// Assign trainers to batch
export const assignTrainers = async (batchId, trainerIds) => {
  return await axios.post(`${API_BASE_URL}/batches/${batchId}/assign-trainers`, { trainer_ids: trainerIds });
};

export const createFullBatch = async (batchData) => {
  return await axios.post(`${API_BASE_URL}/batches/full`, batchData);
};

export const assignTrainingToBatch = async (batchId, trainingId) => {
  return await axios.post(`${API_BASE_URL}/batch-training`, { batch_id: batchId, training_id: trainingId });
};

export const getBatchTrainings = async (batchId) => {
  return await axios.get(`${API_BASE_URL}/batch-training/${batchId}`);
};

export const getTrainingEnrollments = async (trainingId) => {
  return await axios.get(`${API_BASE_URL}/training/${trainingId}/enrollments`);
};

export const createTraining = async (trainingData) => {
  return await axios.post(`${API_BASE_URL}/trainings`, trainingData);
};

// Get all trainings
export const getTrainings = async () => {
  return await axios.get(`${API_BASE_URL}/getAllTraining`);  // Assuming this route is available
};

//get all docs
export const getDocuments = async () => {
  return await axios.get(`${API_BASE_URL}/documents`);
};

// Upload Certification
export const uploadCertification = async (certData) => {
  return await axios.post(`${API_BASE_URL}/upload-certification`, certData, {
      headers: { "Content-Type": "multipart/form-data" }
  });
};

// Fetch All Certifications
export const getCertifications = async () => {
  return await axios.get(`${API_BASE_URL}/certifications`);
};


import React, { useState, useEffect } from 'react';
import { createFullBatch, getTrainees, getTrainers } from '../services/api';
import './css/AddBatch.css';

const AddBatch = () => {
  const [batchName, setBatchName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [trainees, setTrainees] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainees, setSelectedTrainees] = useState([]);
  const [selectedTrainers, setSelectedTrainers] = useState([]);

  useEffect(() => {
    getTrainees().then(response => setTrainees(response.data));
    getTrainers().then(response => setTrainers(response.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const batchData = {
      batch_name: batchName,
      start_date: startDate,
      end_date: endDate,
      trainee_ids: selectedTrainees,
      trainer_ids: selectedTrainers
    };

    try {
      await createFullBatch(batchData);
      alert('Batch created successfully!');
    } catch (error) {
      console.error('Error creating batch:', error);
      alert('Failed to create batch.');
    }
  };

  return (
    <div className="add-batch">
      <h2>Create New Batch</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Batch Name" value={batchName} onChange={(e) => setBatchName(e.target.value)} required />
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />

        <label>Select Trainees:</label>
        <select multiple onChange={(e) => setSelectedTrainees([...e.target.selectedOptions].map(o => o.value))}>
          {trainees.map(trainee => (
            <option key={trainee.employee_id} value={trainee.employee_id}>
              {trainee.first_name} {trainee.last_name}
            </option>
          ))}
        </select>

        <label>Select Trainers:</label>
        <select multiple onChange={(e) => setSelectedTrainers([...e.target.selectedOptions].map(o => o.value))}>
          {trainers.map(trainer => (
            <option key={trainer.employee_id} value={trainer.employee_id}>
              {trainer.first_name} {trainer.last_name}
            </option>
          ))}
        </select>

        <button type="submit">Create Batch</button>
      </form>
    </div>
  );
};

export default AddBatch;

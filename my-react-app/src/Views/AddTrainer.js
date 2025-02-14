import React, { useState } from 'react';
import axios from 'axios';

const AddTrainer = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Trainer');
  const [team, setTeam] = useState('Learning and Development');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/employees', {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      role,
      team,
    })
      .then(response => {
        alert('Trainer added successfully!');
      })
      .catch(error => {
        console.error('Error adding trainer:', error);
        alert('Error adding trainer.');
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" required />
      <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" required />
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="Trainer">Trainer</option>
        <option value="Trainee">Trainee</option>
        <option value="Manager">Manager</option>
        <option value="Employee">Employee</option>
      </select>
      <input type="text" value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Team" />
      <button type="submit">Add Trainer</button>
    </form>
  );
};

export default AddTrainer;

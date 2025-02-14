import React, { useState } from "react";
import axios from "axios";

const AddTrainer = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Trainer");

  // Function to generate a random 8-character password
  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const password = generatePassword(); // ✅ Generate random password

    try {
      // 📌 Call /employees API (Backend will handle user creation)
      await axios.post("http://localhost:3001/employees", {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        role,
        password, // ✅ Send password directly (hashed in backend)
      });

      alert(`Trainer added successfully!\nUsername: ${email}\nPassword: ${password}`);
    } catch (error) {
      console.error("❌ Error adding trainer:", error);
      alert("Error adding trainer.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First Name"
        required
      />
      <input
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Last Name"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (used as username)"
        required
      />
      <input
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone"
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="Trainer">Trainer</option>
        <option value="Trainee">Trainee</option>
        <option value="Manager">Manager</option>
        <option value="Employee">Employee</option>
      </select>

      <button type="submit">Add Trainer</button>
    </form>
  );
};

export default AddTrainer;

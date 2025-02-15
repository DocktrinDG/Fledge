import '../css/AdminDashboard.css';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer"


const AdminDashboard = () => {
	const navigate = useNavigate();


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
			setFirstName("");
			setLastName('');
			setEmail('');
			setPhone('');
			setRole('');
			alert(`Trainer added successfully!\nUsername: ${email}\nPassword: ${password}`);
		} catch (error) {
			console.error("❌ Error adding trainer:", error);
			alert("Error adding trainer.");
		}
	};
	return (
		<div className="page">
			<div className="top-bar">
				<div className="top-bar-child" />
				<div className="title">Admin Dashboard</div>
				<div className="navigation">
					<button className="tab" onClick={() => navigate('employee')}>Employees</button>
					<button className="tab" onClick={() => navigate('batch')}>Batch</button>
					<button className="tab" onClick={()=>navigate('/admin/trainee')}>Trainers</button>
					<button className="tab" onClick={()=>navigate('/admin/trainer')}>Trainees</button>
				</div>
			</div>
			<div className="container">
				<b className="title1">Employee Management</b>
				<div className="description">Add and manage employees efficiently</div>
			</div>
			<form className="form" onSubmit={handleSubmit}>
				<div className="container1">
					<b className="title2">Add Employee</b>
				</div>
				<div className="list">
					<div className="row">
						<div className="input">
							<div className="title3">First Name</div>
							<input type='text' value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								placeholder="First Name"
								required className="textfield1" />
						</div>
					</div>
					<div className="row">
						<div className="input">
							<div className="title3">Last Name</div>
							<input type='text' className="textfield1" value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								placeholder="Last Name"
								required />

						</div>
					</div>
					<div className="row">
						<div className="input">
							<div className="title3">Email</div>
							<input type='text' value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Email"
								required className="textfield1" />

						</div>
					</div>
					<div className="row">
						<div className="input">
							<div className="title3">Phone</div>
							<input type='text' value={phone}
								onChange={(e) => setPhone(e.target.value)}
								placeholder="Phone"
								required className="textfield1" />
						</div>
					</div>
					<div className="row">
						<div className="input">
							<div className="title3">Role</div>
							<select className="textfield1" value={role} onChange={(e) => setRole(e.target.value)}>
								<option value="Trainer">Trainer</option>
								<option value="Trainee">Trainee</option>
								<option value="Manager">Manager</option>
								<option value="Admin">Admin</option>
							</select>
						</div>
					</div>
					<div className="button">
						<button type='submit' className="primary">Add Employee</button>
					</div>
				</div>
				<img className="form-child" alt="" src="Vector 200.svg" />
			</form>
			<Footer />
		</div>);
};

export default AdminDashboard;

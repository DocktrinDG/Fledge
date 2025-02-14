import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>Admin</h2>
      </div>
      <ul className="sidebar-menu">
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/add-trainer">Add Trainer</Link></li>
        <li><Link to="/add-trainee">Add Trainee</Link></li>
        <li><Link to="/add-batch">Add Batch</Link></li>
        <li><Link to="/assign-trainer">Assign Trainer</Link></li>
        <li><Link to="/assign-trainee">Assign Trainee</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;

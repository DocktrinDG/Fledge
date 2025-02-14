import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Use Routes instead of Switch
import LoginPage from './Views/LoginPage';  
import Dashboard from './Views/Dashboard'; 
import AddTrainer from './Views/AddTrainer'; 
import AddBatch from './Views/AddBatch'; 
import AssignTraining from './Views/AssignTraining';
import CreateTraining from './Views/CreateTraining';
import UploadDocument from './Views/UploadDocument';
import Library from './Views/Library';
import UploadCertification from './Views/UploadCertification';
import Homepage from './Views/Employee/Homepage';
import ManagerDashboard from './Views/Employee/ManagerDashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add_batch" element={<AddBatch />} />
        <Route path="/add_employee" element={<AddTrainer />} />
        <Route path="/assign_training" element={<AssignTraining />} />
        <Route path="/create-training" element={<CreateTraining />} />
        <Route path="/upload-doc" element={<UploadDocument />} />
        <Route path="/library" element={<Library />} />
        <Route path="/upload-certification" element={< UploadCertification/>} />
        <Route path="/homepage" element={< Homepage/>} />
        <Route path="/manager-dashboard" element={< ManagerDashboard/>} />
      </Routes>
    </Router>
  );
};

export default App;

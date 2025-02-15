import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Use Routes instead of Switch
import LoginPage from './Views/LoginPage';  
import ViewAllEmployees from './Views/ViewAllEmployees'; 
import AddTrainer from './Views/AddTrainer'; 
import AddBatch from './Views/AddBatch'; 
import AssignTraining from './Views/AssignTraining';
import CreateTraining from './Views/CreateTraining';
import UploadDocument from './Views/UploadDocument';
import Library from './Views/Library';
import UploadCertification from './Views/UploadCertification';
import Homepage from './Views/Employee/Homepage';
import TrainerDashboard from './Views/Employee/TrainerDashboard';
import AdminDashboard from './Views/Admin/AdminDashboard';
import Batch from './Views/Batch';
import Trainee from './Views/Trainee';
import Trainer from './Views/Trainer';



const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/add_batch" element={<AddBatch />} />
        <Route path="/add_employee" element={<AddTrainer />} />
        <Route path="/assign_training" element={<AssignTraining />} />
        <Route path="/create-training" element={<CreateTraining />} />
        <Route path="/upload-doc" element={<UploadDocument />} />
        <Route path="/library" element={<Library />} />
        <Route path="/upload-certification" element={< UploadCertification/>} />
        <Route path="/homepage" element={< Homepage/>} />
        <Route path="/trainer-dashboard" element={< TrainerDashboard/>} />
        <Route path="/admin" element={< AdminDashboard/>} />
        <Route path="/admin/employee" element={<ViewAllEmployees />} />
        <Route path="/admin/batch" element={<Batch />} />
        <Route path="/admin/trainer" element={<Trainer />} />
        <Route path="/admin/trainee" element={<Trainee />} />

      </Routes>
    </Router>
  );
};

export default App;

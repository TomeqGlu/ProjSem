import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { PrivateRoute } from './components/PrivateRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { JobsList } from './pages/JobsList';
import { JobDetails } from './pages/JobDetails';
import { JobForm } from './pages/JobForm';

import { Dashboard } from './pages/Dashboard';

import './styles/main.css';
import { PublicRoute } from './components/PublicRoute';
import { RecruiterRoute } from './components/RecruiterRoute';
import { CandidateRoute } from './components/CandidateRoute';
import { Apply } from './pages/Apply';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="main">
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route path="/jobs" element={<JobsList />} />
          <Route path="/jobs/:id" element={<JobDetails />} />

          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            <Route element={<RecruiterRoute />}>
              <Route path="/jobs/new" element={<JobForm />} />
              <Route path="/jobs/:id/edit" element={<JobForm />} />
            </Route>

            <Route element={<CandidateRoute />}>
              <Route path="/jobs/:id/apply" element={<Apply />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/jobs" replace />} />
          <Route path="*" element={<Navigate to="/jobs" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
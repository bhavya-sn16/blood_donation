import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import RegisterDonor from './pages/RegisterDonor.jsx';
import CreateRequest from './pages/CreateRequest.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/register" element={<RegisterDonor />} />
        <Route path="/requests/new" element={<CreateRequest />} />
        {/* optional: catch-all back to dashboard */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import MarketData from './pages/MarketData';
import Analytics from './pages/Analytics';
import Marketplace from './pages/Marketplace';
import MyListings from './pages/MyListings';
import MyRequests from './pages/MyRequests';
import Profile from './pages/Profile';
import AIAssistant from './pages/AIAssistant';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/market-data" element={<MarketData />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/ai" element={<AIAssistant />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/my-requests" element={<MyRequests />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route element={<ProtectedRoute roles={['FARMER', 'VENDOR']} />}>
              <Route path="/my-listings" element={<MyListings />} />
            </Route>
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;

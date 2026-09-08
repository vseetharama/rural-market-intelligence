import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import MarketData from './pages/MarketData';
import Analytics from './pages/Analytics';
import Marketplace from './pages/Marketplace';
import SellProduct from './pages/SellProduct';
import MyListings from './pages/MyListings';
import MyRequests from './pages/MyRequests';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import AIAssistant from './pages/AIAssistant';
import WhereShoudISell from './pages/WhereShoudISell';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminMarketData from './pages/AdminMarketData';

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
            <Route path="/where-should-i-sell" element={<WhereShoudISell />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/ai" element={<AIAssistant />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/my-requests" element={<MyRequests />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>

            <Route element={<ProtectedRoute roles={['FARMER', 'VENDOR']} />}>
              <Route path="/sell-product" element={<SellProduct />} />
              <Route path="/my-listings" element={<MyListings />} />
            </Route>

            <Route element={<ProtectedRoute roles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/market-data" element={<AdminMarketData />} />
            </Route>
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;

import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  User, 
  Briefcase, 
  Sparkles, 
  AlertCircle, 
  TrendingUp, 
  Search, 
  LogOut, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="brand-icon-box">
            <Compass size={22} strokeWidth={2.3} />
          </div>
          <span>CareerMatch<span style={{ color: 'var(--primary-600)' }}>.AI</span></span>
        </Link>

        {/* Navigation Links */}
        <nav className="nav-links">
          {!user ? (
            <>
              <Link to="/#features" className="nav-item">Features</Link>
              <Link to="/#how-it-works" className="nav-item">How It Works</Link>
              <NavLink to="/opportunities" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Search size={16} /> Explore Opportunities
              </NavLink>
            </>
          ) : isAdmin ? (
            <>
              <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <ShieldCheck size={16} /> Admin Portal
              </NavLink>
              <NavLink to="/opportunities" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Briefcase size={16} /> Manage Opportunities
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <TrendingUp size={16} /> Dashboard
              </NavLink>
              <NavLink to="/recommendations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Briefcase size={16} /> Recommendations
              </NavLink>
              <NavLink to="/skill-gaps" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <AlertCircle size={16} /> Skill Gaps
              </NavLink>
              <NavLink to="/career-roles" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Compass size={16} /> Career Roles
              </NavLink>
              <NavLink to="/opportunities" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Search size={16} /> Opportunities
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <User size={16} /> My Profile
              </NavLink>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!user ? (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started <ChevronRight size={15} />
              </Link>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {!isAdmin && (
                <Link to="/ai-analysis" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={15} color="var(--primary-600)" /> AI Analyzer
                </Link>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px', borderLeft: '1px solid var(--border-subtle)' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {user.name.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {isAdmin ? 'Administrator' : (user.department ? user.department.substring(0, 18) : 'Student')}
                  </div>
                </div>

                <button 
                  onClick={handleLogout} 
                  className="btn btn-secondary btn-sm"
                  title="Sign Out"
                  style={{ padding: '8px 10px', color: 'var(--text-muted)' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

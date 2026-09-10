import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, CheckCircle2, Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#ffffff',
      borderTop: '1px solid var(--border-subtle)',
      padding: '48px 0 32px 0',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1.2fr',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Col 1: Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div className="brand-icon-box" style={{ width: '32px', height: '32px' }}>
                <Compass size={18} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                CareerMatch<span style={{ color: 'var(--primary-600)' }}>.AI</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '340px' }}>
              AI-Based Student Career, Skill Gap and Internship Recommendation System powered by TF-IDF vectorization, semantic skill alignment, and personalized learning roadmaps.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <span className="badge badge-primary">React 18</span>
              <span className="badge badge-success">Python Flask</span>
              <span className="badge badge-purple">Scikit-Learn</span>
            </div>
          </div>

          {/* Col 2: Platform */}
          <div>
            <h4 style={{ fontSize: '0.92rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Platform
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem' }}>
              <li><Link to="/recommendations" style={{ color: 'var(--text-secondary)' }}>Internship Recommendations</Link></li>
              <li><Link to="/skill-gaps" style={{ color: 'var(--text-secondary)' }}>Skill Gap Analyzer</Link></li>
              <li><Link to="/career-roles" style={{ color: 'var(--text-secondary)' }}>Career Role Explorer</Link></li>
              <li><Link to="/opportunities" style={{ color: 'var(--text-secondary)' }}>Search Opportunities</Link></li>
            </ul>
          </div>

          {/* Col 3: Student Tools */}
          <div>
            <h4 style={{ fontSize: '0.92rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Student Tools
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem' }}>
              <li><Link to="/profile" style={{ color: 'var(--text-secondary)' }}>Profile & Skills Builder</Link></li>
              <li><Link to="/ai-analysis" style={{ color: 'var(--text-secondary)' }}>AI Profile Analysis</Link></li>
              <li><Link to="/dashboard" style={{ color: 'var(--text-secondary)' }}>Domain Fit Radar</Link></li>
              <li><Link to="/login" style={{ color: 'var(--text-secondary)' }}>Sign In / Register</Link></li>
            </ul>
          </div>

          {/* Col 4: Engine Specs */}
          <div>
            <h4 style={{ fontSize: '0.92rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Matching Engine
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="var(--success-600)" /> 50% Weighted Technical Skills
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="var(--success-600)" /> 20% Career Interest Alignment
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="var(--success-600)" /> 10% TF-IDF Project Similarity
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="var(--success-600)" /> 10% Qualification & CGPA
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="var(--success-600)" /> 10% Work Mode & Preferences
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.86rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} CareerMatch AI. Final Year Internship & Capstone Project.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Clean White Modern UI</span>
            <span>REST API Verified</span>
            <span>Zero-Config Dual DB</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

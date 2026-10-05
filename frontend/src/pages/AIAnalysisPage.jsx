import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { aiService } from '../services/api';
import { 
  Sparkles, 
  CheckCircle2, 
  BrainCircuit, 
  Compass, 
  ArrowRight, 
  AlertCircle, 
  BarChart3,
  Target
} from 'lucide-react';

const AIAnalysisPage = () => {
  const [analyzing, setAnalyzing] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setError('');
    try {
      // Small intentional delay to show sleek AI calculation animation
      const [res] = await Promise.all([
        aiService.analyzeProfile(),
        new Promise(resolve => setTimeout(resolve, 900))
      ]);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Unable to run AI analysis. Please ensure your profile is filled and backend is running.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (analyzing) {
    return (
      <div style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 20px',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)',
          marginBottom: '24px'
        }} className="animate-pulse-glow">
          <BrainCircuit size={38} />
        </div>

        <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Analyzing Your Technical Profile...
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', marginBottom: '24px', lineHeight: '1.6' }}>
          Comparing your technical competencies, academic projects, and domain interests against current industry benchmarks and job vacancies.
        </p>

        <div style={{ width: '280px', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--primary-600)',
            borderRadius: '999px',
            animation: 'analysisProgress 1.4s ease-in-out infinite'
          }} />
        </div>
        <style>{`
          @keyframes analysisProgress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{
          maxWidth: '500px',
          margin: '0 auto',
          padding: '32px',
          backgroundColor: 'var(--danger-50)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--danger-100)',
          color: 'var(--danger-600)'
        }}>
          <AlertCircle size={32} style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ marginBottom: '8px', color: 'var(--danger-600)' }}>Analysis Incomplete</h3>
          <p style={{ fontSize: '0.92rem', marginBottom: '20px' }}>{error}</p>
          <button onClick={runAnalysis} className="btn btn-primary">
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  const { profile_strength, strong_areas, primary_interest, suggested_career_domain, top_career_role, domain_scores, suggestions, matched_roles } = data;

  const getStrengthColor = (s) => {
    if (s >= 80) return 'var(--success-600)';
    if (s >= 60) return 'var(--primary-600)';
    return 'var(--warning-600)';
  };

  return (
    <div style={{ padding: '40px 0 80px 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-success">AI Diagnostic Complete</span>
              <span className="badge badge-primary">Scikit-Learn Evaluated</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--text-primary)' }}>
              Profile Diagnostics & Career Fit
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Detailed synthesis of your domain readiness, profile strength, and role suitability.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={runAnalysis} className="btn btn-secondary">
              <Sparkles size={16} /> Re-analyze
            </button>
            <Link to="/recommendations" className="btn btn-primary">
              View Recommended Jobs <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Top Summary Banner Cards */}
        <div className="grid-3" style={{ marginBottom: '32px' }}>
          {/* 1. Profile Strength Gauge */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              border: `6px solid ${getStrengthColor(profile_strength)}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              backgroundColor: 'var(--bg-secondary)'
            }}>
              <span style={{ fontSize: '1.6rem', fontWeight: '800', lineHeight: '1', color: 'var(--text-primary)' }}>
                {profile_strength}%
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>
                Score
              </span>
            </div>

            <div>
              <span className="badge badge-primary" style={{ marginBottom: '6px' }}>Overall Readiness</span>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Profile Strength</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {profile_strength >= 80 ? 'Comprehensive profile with strong signals across skills & projects.' : 'Good foundation! Adding more projects and skills will boost match accuracy.'}
              </p>
            </div>
          </div>

          {/* 2. Top Career Role Archetype */}
          <div className="card">
            <span className="badge badge-purple" style={{ marginBottom: '8px' }}>Top Recommended Role</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'var(--purple-50)', color: 'var(--purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                {top_career_role}
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Best-fitting career path based on your current technical portfolio and domain preferences.
            </p>
          </div>

          {/* 3. Primary Target Domain */}
          <div className="card">
            <span className="badge badge-success" style={{ marginBottom: '8px' }}>Suggested Tech Domain</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'var(--success-50)', color: 'var(--success-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                {suggested_career_domain}
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              High market demand in your region with multiple target internship openings.
            </p>
          </div>
        </div>

        {/* Two Column Layout: Domain Fit Scores vs AI Actionable Roadmap */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '32px', marginBottom: '32px' }}>
          {/* Domain Fit Scores */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem' }}>Career Domain Suitability Scores</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Calculated from student skills, projects, and domain interests</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {domain_scores.map((d) => (
                <div key={d.domain}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.9rem' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {d.domain}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {d.matched_skills_count} / {d.total_domain_skills} skills
                      </span>
                      <strong style={{ color: d.score >= 70 ? 'var(--success-600)' : d.score >= 50 ? 'var(--primary-600)' : 'var(--text-muted)' }}>
                        {d.score}% Fit
                      </strong>
                    </div>
                  </div>

                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${d.score}%`,
                        backgroundColor: d.score >= 70 ? 'var(--success-600)' : d.score >= 50 ? 'var(--primary-600)' : '#94a3b8'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Strong Areas Badges */}
            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px' }}>
                Dominant Strong Areas Identified
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {strong_areas.map((area, idx) => (
                  <span key={idx} className="badge badge-success" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                    ✓ {area}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* AI Suggestions & Next Steps */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--warning-50)', color: 'var(--warning-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem' }}>AI Profile Enhancements</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Actionable advice to maximize your match percentage</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
              {suggestions.map((sug, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '14px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <div style={{ color: 'var(--primary-600)', flexShrink: 0, marginTop: '2px' }}>
                    <CheckCircle2 size={18} />
                  </div>
                  <span>{sug}</span>
                </div>
              ))}
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/recommendations" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                Explore Ranked Opportunities <ArrowRight size={16} />
              </Link>
              <Link to="/skill-gaps" className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                Review Skill Gap Matrix & Learning Roadmaps
              </Link>
            </div>
          </div>
        </div>

        {/* Top 3 Archetype Matches Preview */}
        {matched_roles && matched_roles.length > 0 && (
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>
              Top Career Roles Benchmarking
            </h3>
            <div className="grid-3">
              {matched_roles.map((r, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '18px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="badge badge-primary">{r.domain}</span>
                    <span className="badge badge-success">{r.suitability}% Match</span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                    {r.role}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '12px' }}>
                    {r.description}
                  </p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <strong>Next skill to learn:</strong> {r.missing_skills.length > 0 ? r.missing_skills[0] : 'Ready to apply!'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysisPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentService, recommendationService, aiService, skillGapService } from '../services/api';
import OpportunityDetailsModal from '../components/OpportunityDetailsModal';
import { 
  TrendingUp, 
  Layers, 
  Briefcase, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Building2, 
  MapPin, 
  Compass, 
  BarChart2, 
  BookOpen
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [domainScores, setDomainScores] = useState([]);
  const [skillGapSummary, setSkillGapSummary] = useState(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [profRes, recRes, domainRes, gapRes] = await Promise.all([
        studentService.getProfile(),
        recommendationService.getRecommendations(),
        aiService.getDomainScores(),
        skillGapService.getSkillGaps(),
      ]);

      setProfile(profRes.data.profile);
      setSkills(profRes.data.skills || []);
      setRecommendations(recRes.data.recommendations || []);
      setDomainScores(domainRes.data.domain_scores || []);
      setSkillGapSummary(gapRes.data);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const topMatch = recommendations.length > 0 ? recommendations[0] : null;

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    let score = 20; // registered
    if (profile?.cgpa && profile.cgpa > 0) score += 20;
    if (skills.length > 0) score += 20;
    if (profile?.interests) score += 15;
    if (profile?.preferred_domain) score += 10;
    if (skillGapSummary?.summary?.total_student_skills >= 5) score += 15;
    return Math.min(100, score);
  };

  const completionPct = calculateCompletion();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading student dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 80px 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Welcome Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span className="badge badge-primary">Student Dashboard</span>
              <span className="badge badge-neutral">{user?.college || profile?.college || 'Rathinam Technical Campus'}</span>
              <span className="badge badge-secondary">{user?.qualification || profile?.qualification || 'B.E. Computer Science and Engineering'}</span>
              <span className="badge badge-neutral">{user?.year_of_study || user?.year || '3rd Year'}</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--text-primary)' }}>
              Welcome back, {user?.name || 'Nisha R'} 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <strong>{user?.college || 'Rathinam Technical Campus'}</strong> • {user?.department || 'Computer Science & Engineering'} • {user?.qualification || 'B.E. CSE'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/ai-analysis" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} /> Live AI Diagnosis
            </Link>
            <Link to="/profile" className="btn btn-primary">
              Edit Skills & Profile
            </Link>
          </div>
        </div>

        {/* 4 Stat Widgets Strip */}
        <div className="grid-4" style={{ marginBottom: '32px' }}>
          {/* Stat 1: Profile Completion */}
          <div className="stat-widget">
            <div className="stat-icon blue">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="stat-value">{completionPct}%</div>
              <div className="stat-label">Profile Completion</div>
            </div>
          </div>

          {/* Stat 2: Active Skills */}
          <div className="stat-widget">
            <div className="stat-icon purple">
              <Layers size={24} />
            </div>
            <div>
              <div className="stat-value">{skills.length}</div>
              <div className="stat-label">Active Skills Logged</div>
            </div>
          </div>

          {/* Stat 3: Top Opportunity Match */}
          <div className="stat-widget">
            <div className="stat-icon green">
              <Briefcase size={24} />
            </div>
            <div>
              <div className="stat-value">
                {topMatch ? `${topMatch.match_percentage}%` : 'N/A'}
              </div>
              <div className="stat-label">Top Opportunity Match</div>
            </div>
          </div>

          {/* Stat 4: High Priority Gaps */}
          <div className="stat-widget">
            <div className="stat-icon amber">
              <AlertCircle size={24} />
            </div>
            <div>
              <div className="stat-value">
                {skillGapSummary?.summary?.high_priority_gaps || 0}
              </div>
              <div className="stat-label">High-Priority Skill Gaps</div>
            </div>
          </div>
        </div>

        {/* Skill Gap Alert Banner if gaps exist */}
        {skillGapSummary?.summary?.high_priority_gaps > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            backgroundColor: 'var(--warning-50)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--warning-100)',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--warning-600)',
                flexShrink: 0,
                boxShadow: 'var(--shadow-xs)'
              }}>
                <AlertCircle size={22} />
              </div>
              <div>
                <strong style={{ color: '#92400e', fontSize: '0.98rem' }}>
                  {skillGapSummary.summary.high_priority_gaps} High-Demand Skills Missing for Top Internships
                </strong>
                <p style={{ color: '#b45309', fontSize: '0.86rem', marginTop: '2px' }}>
                  Upskilling in these areas can boost your recommendation match rate by up to 25%.
                </p>
              </div>
            </div>

            <Link to="/skill-gaps" className="btn btn-secondary btn-sm" style={{ borderColor: '#fcd34d', color: '#92400e' }}>
              View Learning Roadmap <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {/* Two Columns: Domain Suitability Chart vs Recommended Opportunities */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr', gap: '32px', marginBottom: '32px' }}>
          {/* Column 1: Domain Fit Meter */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem' }}>Domain Suitability Fit</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Skill alignment across standard sectors</p>
                </div>
              </div>
              <Link to="/career-roles" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                View Roles →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {domainScores.slice(0, 5).map((d) => (
                <div key={d.domain}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.88rem' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{d.domain}</span>
                    <span style={{ fontWeight: '700', color: d.score >= 70 ? 'var(--success-600)' : 'var(--primary-600)' }}>
                      {d.score}%
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${d.score}%`,
                        backgroundColor: d.score >= 70 ? 'var(--success-600)' : 'var(--primary-600)'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Link Footer */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Target Domain: <strong>{profile?.preferred_domain || 'General Tech'}</strong>
              </span>
              <Link to="/ai-analysis" className="btn btn-outline btn-sm">
                Full AI Radar
              </Link>
            </div>
          </div>

          {/* Column 2: Top 3 Recommended Opportunities */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--success-50)', color: 'var(--success-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem' }}>Top Matching Opportunities</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Personalized recommendations ranked by AI</p>
                </div>
              </div>
              <Link to="/recommendations" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                View All ({recommendations.length}) →
              </Link>
            </div>

            {recommendations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                No recommendations found yet. Update your skills in your profile to trigger matches!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {recommendations.slice(0, 3).map((rec) => (
                  <div
                    key={rec.id}
                    className="card card-clickable"
                    onClick={() => setSelectedOpportunity(rec)}
                    style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <span className="badge badge-primary" style={{ marginBottom: '4px' }}>
                          {rec.domain}
                        </span>
                        <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                          {rec.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <Building2 size={14} />
                          <span>{rec.company || rec.company_name}</span>
                          <span>•</span>
                          <MapPin size={13} />
                          <span>{rec.location}</span>
                        </div>
                      </div>

                      <span className={`match-score-pill ${rec.match_percentage >= 75 ? 'match-high' : 'match-mid'}`}>
                        {rec.match_percentage}% Match
                      </span>
                    </div>

                    {/* Matching skills snippet */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                      {rec.matching_skills && rec.matching_skills.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="skill-tag matched" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                          ✓ {s}
                        </span>
                      ))}
                      {rec.matching_skills && rec.matching_skills.length > 3 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                          +{rec.matching_skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="grid-3">
          <Link to="/recommendations" className="card card-clickable" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Briefcase size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                All Recommendations
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Ranked internships with full score breakdowns
              </p>
            </div>
          </Link>

          <Link to="/skill-gaps" className="card card-clickable" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--warning-50)', color: 'var(--warning-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                Skill Gap Roadmaps
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Learn missing skills with project suggestions
              </p>
            </div>
          </Link>

          <Link to="/career-roles" className="card card-clickable" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--purple-50)', color: 'var(--purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Compass size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                Career Role Explorer
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Discover industry roles best suited to your profile
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Opportunity Details Modal */}
      {selectedOpportunity && (
        <OpportunityDetailsModal
          opportunity={selectedOpportunity}
          studentSkills={skills}
          onClose={() => setSelectedOpportunity(null)}
        />
      )}
    </div>
  );
};

export default DashboardPage;

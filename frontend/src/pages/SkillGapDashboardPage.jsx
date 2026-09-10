import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { skillGapService } from '../services/api';
import { 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  Search, 
  Layers, 
  ArrowRight, 
  Sparkles, 
  FolderGit2, 
  Check, 
  ExternalLink,
  Target
} from 'lucide-react';

const SkillGapDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSkillGaps();
  }, []);

  const fetchSkillGaps = async () => {
    setLoading(true);
    try {
      const res = await skillGapService.getSkillGaps();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Analyzing skill gaps and compiling learning roadmaps...</p>
      </div>
    );
  }

  const { summary = {}, gaps_table = [], learning_recommendations = [] } = data || {};

  // Filter gaps table
  const filteredGaps = gaps_table.filter(item => {
    if (filterStatus !== 'All' && item.status !== filterStatus) {
      return false;
    }
    if (searchQuery && !item.skill.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ padding: '40px 0 80px 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-warning">Market Demand Synthesis</span>
              <span className="badge badge-primary">Curated Learning Paths</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--text-primary)' }}>
              Skill Gap Matrix & Upskilling Roadmap
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Identify which competencies are missing from your profile and follow structured learning paths with recommended projects.
            </p>
          </div>

          <Link to="/profile" className="btn btn-primary">
            Update My Skills <ArrowRight size={16} />
          </Link>
        </div>

        {/* 3 Summary Metric Cards */}
        <div className="grid-3" style={{ marginBottom: '32px' }}>
          <div className="stat-widget">
            <div className="stat-icon green">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="stat-value">{summary.total_student_skills || 0}</div>
              <div className="stat-label">Skills You Have Mastered</div>
            </div>
          </div>

          <div className="stat-widget">
            <div className="stat-icon blue">
              <Layers size={24} />
            </div>
            <div>
              <div className="stat-value">{summary.total_missing_skills || 0}</div>
              <div className="stat-label">Missing Industry Skills</div>
            </div>
          </div>

          <div className="stat-widget">
            <div className="stat-icon amber">
              <AlertCircle size={24} />
            </div>
            <div>
              <div className="stat-value">{summary.high_priority_gaps || 0}</div>
              <div className="stat-label">High-Priority Missing Skills</div>
            </div>
          </div>
        </div>

        {/* Section 1: My Skill Gaps Table */}
        <div className="card" style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                Skill Competency Matrix
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Inventory of your current capabilities compared to market requirements
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '32px', padding: '8px 12px 8px 32px', fontSize: '0.85rem' }}
                />
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {['All', 'Completed', 'Missing'].map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Skill Name</th>
                <th>Market Importance</th>
                <th>Current Status</th>
                <th>Learning Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredGaps.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>
                    No skills matched your search filter.
                  </td>
                </tr>
              ) : (
                filteredGaps.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{item.skill}</strong>
                    </td>
                    <td>
                      <span className={`badge ${item.importance === 'High' ? 'badge-warning' : 'badge-neutral'}`}>
                        {item.importance} Demand
                      </span>
                    </td>
                    <td>
                      {item.status === 'Completed' ? (
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={13} /> Completed
                        </span>
                      ) : (
                        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          ✗ Missing
                        </span>
                      )}
                    </td>
                    <td>
                      {item.status === 'Missing' ? (
                        <a
                          href={`#roadmap-${item.skill.toLowerCase().replace(/\s+/g, '-')}`}
                          style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary-600)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          View Roadmap ↓
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Skill Verified</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Section 2: Personalized Learning Roadmaps */}
        <div>
          <div style={{ marginBottom: '24px' }}>
            <span className="badge badge-primary" style={{ marginBottom: '8px' }}>Actionable Learning Paths</span>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>
              Targeted Upskilling Roadmaps
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Follow these recommended curriculum modules and practical capstone projects to acquire your missing competencies.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {learning_recommendations.map((rec, idx) => {
              const anchorId = `roadmap-${rec.skill.toLowerCase().replace(/\s+/g, '-')}`;

              return (
                <div key={idx} id={anchorId} className="card" style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span className="badge badge-danger">Missing Competency</span>
                        <span className="badge badge-warning">{rec.importance} Priority</span>
                      </div>
                      <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>
                        Mastering {rec.skill}
                      </h3>
                    </div>

                    <Link to="/profile" className="btn btn-outline btn-sm">
                      + Mark as Learned in Profile
                    </Link>
                  </div>

                  {/* Why Learn */}
                  <div style={{ marginBottom: '20px', backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Why Learn This Skill?
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                      {rec.why_learn}
                    </p>
                  </div>

                  {/* Two Columns: Core Topics vs Recommended Project */}
                  <div className="grid-2">
                    {/* Core Topics */}
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                        <BookOpen size={16} color="var(--primary-600)" /> Core Topics & Concepts to Study
                      </div>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                        {rec.topics.map((t, tIdx) => (
                          <li key={tIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)' }}>
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.75rem', fontWeight: '700', marginTop: '2px' }}>
                              {tIdx + 1}
                            </div>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommended Project */}
                    <div style={{ padding: '18px', backgroundColor: 'var(--success-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--success-100)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--success-700)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <FolderGit2 size={16} /> Recommended Portfolio Project
                      </div>
                      <p style={{ color: '#064e3b', fontWeight: '600', fontSize: '0.95rem', marginBottom: '8px' }}>
                        {rec.project}
                      </p>
                      <p style={{ color: '#047857', fontSize: '0.85rem', lineHeight: '1.5' }}>
                        Building and deploying this project to GitHub will provide tangible proof of competence to potential interviewers.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillGapDashboardPage;

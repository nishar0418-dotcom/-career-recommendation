import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { skillGapService, studentService } from '../services/api';
import RoadmapCard from '../components/RoadmapCard';
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
  Target,
  Trophy,
  RotateCcw
} from 'lucide-react';

const SkillGapDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [savingSkillName, setSavingSkillName] = useState(null);
  const [addedSkillsMap, setAddedSkillsMap] = useState({});
  const [notification, setNotification] = useState('');

  // Persisted completed roadmap steps in localStorage
  const [completedSteps, setCompletedSteps] = useState(() => {
    try {
      const saved = localStorage.getItem('careermatch_roadmap_completed_steps');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

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

  const handleToggleStep = (stepId) => {
    setCompletedSteps(prev => {
      const isNowCompleted = !prev[stepId];
      const updated = { ...prev, [stepId]: isNowCompleted };
      try {
        localStorage.setItem('careermatch_roadmap_completed_steps', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      if (isNowCompleted) {
        showTemporaryNotification('Step marked as completed! Keep going! 🚀');
      }
      return updated;
    });
  };

  const handleAddSkillToProfile = async (skillName) => {
    setSavingSkillName(skillName);
    try {
      await studentService.addSkill({
        skill_name: skillName,
        proficiency: 'Intermediate'
      });
      setAddedSkillsMap(prev => ({ ...prev, [skillName.toLowerCase()]: true }));
      showTemporaryNotification(`✓ Successfully added ${skillName} to your profile skills!`);
      // Refresh the skill gap analysis so the matrix updates
      await fetchSkillGaps();
    } catch (err) {
      console.error(err);
      showTemporaryNotification(`Could not add ${skillName}. Please try again.`);
    } finally {
      setSavingSkillName(null);
    }
  };

  const handleResetProgress = () => {
    if (window.confirm('Reset all roadmap step progress?')) {
      setCompletedSteps({});
      localStorage.removeItem('careermatch_roadmap_completed_steps');
      showTemporaryNotification('All roadmap steps reset.');
    }
  };

  const showTemporaryNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification('');
    }, 3500);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Analyzing skill gaps and compiling learning roadmaps...</p>
      </div>
    );
  }

  const { summary = {}, gaps_table = [], learning_recommendations = [] } = data || {};

  // Overall roadmap metrics
  const totalRoadmapSteps = learning_recommendations.reduce((acc, rec) => acc + (rec.topics?.length || 0) + 1, 0);
  const totalCompletedSteps = Object.values(completedSteps).filter(Boolean).length;
  const overallRoadmapPct = totalRoadmapSteps > 0 ? Math.round((totalCompletedSteps / totalRoadmapSteps) * 100) : 0;

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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <a
                            href={`#roadmap-${item.skill.toLowerCase().replace(/\s+/g, '-')}`}
                            style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary-600)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            View Roadmap ↓
                          </a>
                          {(() => {
                            const pfx = item.skill.toLowerCase();
                            const doneCount = Object.keys(completedSteps).filter(k => k.startsWith(pfx) && completedSteps[k]).length;
                            return doneCount > 0 ? (
                              <span className="badge badge-success" style={{ fontSize: '0.72rem', padding: '2px 7px' }}>
                                {doneCount} Steps Done ✓
                              </span>
                            ) : null;
                          })()}
                        </div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-primary">Actionable Learning Paths</span>
                <span className="badge badge-success">Interactive Steps</span>
              </div>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Targeted Upskilling Roadmaps
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem' }}>
                Follow structured phase-by-phase roadmaps. Click on each step to mark it as completed as you finish your studies and projects.
              </p>
            </div>

            {totalCompletedSteps > 0 && (
              <button
                onClick={handleResetProgress}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Reset all roadmap checkboxes"
              >
                <RotateCcw size={13} /> Reset Step Progress
              </button>
            )}
          </div>

          {/* Overall Roadmap Completion Status Banner */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '18px 24px',
            marginBottom: '24px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: totalCompletedSteps > 0 ? '#ecfdf5' : 'var(--primary-50)',
                color: totalCompletedSteps > 0 ? '#059669' : 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Trophy size={22} />
              </div>
              <div>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem' }}>
                  Overall Roadmap Progress: {totalCompletedSteps} of {totalRoadmapSteps} Steps Completed
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {totalCompletedSteps === 0
                    ? 'Start by clicking on the first step of any missing competency below to track your learning journey.'
                    : `Great momentum! You have completed ${overallRoadmapPct}% of your missing competency steps.`}
                </div>
              </div>
            </div>

            <div style={{ minWidth: '200px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Progress:</span>
                <span style={{ color: 'var(--primary-600)' }}>{overallRoadmapPct}%</span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '999px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${overallRoadmapPct}%`,
                  height: '100%',
                  backgroundColor: overallRoadmapPct === 100 ? '#10b981' : 'var(--primary-600)',
                  transition: 'width 0.4s ease',
                  borderRadius: '999px'
                }} />
              </div>
            </div>
          </div>

          {/* Interactive Roadmap Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {learning_recommendations.map((rec, idx) => (
              <RoadmapCard
                key={idx}
                rec={rec}
                completedStepKeys={completedSteps}
                onToggleStep={handleToggleStep}
                onAddSkillToProfile={handleAddSkillToProfile}
                isAddedToProfile={!!addedSkillsMap[rec.skill.toLowerCase()]}
                savingSkill={savingSkillName === rec.skill}
              />
            ))}
          </div>
        </div>

        {/* Floating Toast Notification */}
        {notification && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 1000,
            fontSize: '0.9rem',
            animation: 'fadeIn 0.2s ease-in-out'
          }}>
            <Sparkles size={16} color="#38bdf8" />
            <span>{notification}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillGapDashboardPage;

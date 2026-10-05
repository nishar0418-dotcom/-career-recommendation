import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recommendationService, studentService, applicationService } from '../services/api';
import OpportunityDetailsModal from '../components/OpportunityDetailsModal';
import ApplyModal from '../components/ApplyModal';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Sparkles, 
  Search, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CheckCircle2,
  Briefcase,
  Send,
  X
} from 'lucide-react';

const parseSkills = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return String(val).split(/[,|/]+/).map(s => s.trim()).filter(Boolean);
};

const getMatchPercentage = (opp) => {
  if (!opp) return 0;
  const val = opp.final_score ?? opp.match_percentage ?? opp.score_breakdown?.final_score ?? 0;
  const num = parseFloat(val);
  return isNaN(num) ? 0 : Math.round(num * 10) / 10;
};

const RecommendationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [studentSkills, setStudentSkills] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [applyingOpportunity, setApplyingOpportunity] = useState(null);
  const [appliedMap, setAppliedMap] = useState({});
  const [expandedBreakdown, setExpandedBreakdown] = useState({});

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedWorkMode, setSelectedWorkMode] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [minMatchPct, setMinMatchPct] = useState(0);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const [recRes, profRes, appRes] = await Promise.all([
        recommendationService.getRecommendations(),
        studentService.getProfile(),
        applicationService.getApplications().catch(() => ({ data: { applications: [] } }))
      ]);
      setRecommendations(recRes.data.recommendations || []);
      const profileData = profRes.data || {};
      setStudentProfile(profileData);
      const profileSkills = profileData.skills || [];
      setStudentSkills(profileSkills);

      // Populate already applied opportunity IDs map
      const apps = appRes?.data?.applications || [];
      const map = {};
      apps.forEach(app => {
        if (app.opportunity_id) {
          map[app.opportunity_id] = true;
        }
      });
      setAppliedMap(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBreakdown = (id) => {
    setExpandedBreakdown(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDomain('All');
    setSelectedWorkMode('All');
    setSelectedType('All');
    setMinMatchPct(0);
  };

  const filteredRecommendations = recommendations.filter(opp => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (opp.title || '').toLowerCase().includes(q);
      const matchCompany = (opp.company || opp.company_name || '').toLowerCase().includes(q);
      const matchSkills = (opp.required_skills || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCompany && !matchSkills) return false;
    }

    if (selectedDomain !== 'All' && !(opp.domain || '').toLowerCase().includes(selectedDomain.toLowerCase())) {
      return false;
    }

    if (selectedWorkMode !== 'All' && !(opp.work_mode || '').toLowerCase().includes(selectedWorkMode.toLowerCase())) {
      return false;
    }

    if (selectedType !== 'All' && !(opp.opportunity_type || '').toLowerCase().includes(selectedType.toLowerCase())) {
      return false;
    }

    const score = getMatchPercentage(opp);
    if (score < Number(minMatchPct)) {
      return false;
    }

    return true;
  });

  const getMatchBadgeClass = (pct) => {
    if (pct >= 75) return 'match-high';
    if (pct >= 50) return 'match-mid';
    return 'match-low';
  };

  return (
    <div style={{ padding: '32px 0 60px 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-success">AI Matched</span>
            <span className="badge badge-primary">{recommendations.length} Opportunities</span>
          </div>
          <h1 style={{ fontSize: '1.9rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Recommended Opportunities
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Jobs and internships matched to your skills.
          </p>
        </div>

        {/* Active Student Skills Banner */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '14px 18px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                Your Profile Skills ({studentSkills.length}):
              </span>
              <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>Active</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {studentSkills.length > 0 ? (
                studentSkills.map((sk, idx) => (
                  <span key={idx} className="skill-tag matched" style={{ fontSize: '0.8rem', padding: '2px 8px' }}>
                    ✓ {typeof sk === 'object' ? (sk.skill_name || sk.name || '') : sk}
                  </span>
                ))
              ) : (
                <span style={{ color: 'var(--danger-600)', fontSize: '0.85rem' }}>
                  No skills in your profile yet. Add skills below to see matches!
                </span>
              )}
            </div>
          </div>
          <Link to="/profile" className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap' }}>
            + Edit Skills in Profile
          </Link>
        </div>

        {/* Filter Toolbar Card */}
        <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 2fr) repeat(4, minmax(130px, 1fr)) auto', gap: '10px', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search title, company, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px', fontSize: '0.88rem' }}
              />
            </div>

            {/* Domain */}
            <select
              className="form-select"
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              style={{ fontSize: '0.88rem' }}
            >
              <option value="All">All Domains</option>
              <option value="Data Science">Data Science</option>
              <option value="Artificial Intelligence">AI & ML</option>
              <option value="Web Development">Web Development</option>
              <option value="Full Stack">Full Stack</option>
              <option value="Cloud Computing">Cloud Computing</option>
              <option value="Cyber Security">Cyber Security</option>
            </select>

            {/* Work Mode */}
            <select
              className="form-select"
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
              style={{ fontSize: '0.88rem' }}
            >
              <option value="All">All Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>

            {/* Type */}
            <select
              className="form-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ fontSize: '0.88rem' }}
            >
              <option value="All">All Types</option>
              <option value="Internship">Internship</option>
              <option value="Job">Full-time Job</option>
            </select>

            {/* Min Match Dropdown */}
            <select
              className="form-select"
              value={minMatchPct}
              onChange={(e) => setMinMatchPct(Number(e.target.value))}
              style={{
                fontSize: '0.88rem',
                fontWeight: minMatchPct > 0 ? '700' : 'normal',
                color: minMatchPct > 0 ? 'var(--primary-700)' : 'inherit',
                borderColor: minMatchPct > 0 ? 'var(--primary-500)' : 'var(--border-subtle)',
                backgroundColor: minMatchPct > 0 ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-primary)'
              }}
            >
              <option value={0}>Min Match: Any</option>
              <option value={50}>Min Match: 50%+</option>
              <option value={60}>Min Match: 60%+</option>
              <option value={65}>Min Match: 65%+</option>
              <option value={70}>Min Match: 70%+</option>
              <option value={75}>Min Match: 75%+</option>
              <option value={80}>Min Match: 80%+</option>
              <option value={85}>Min Match: 85%+</option>
              <option value={90}>Min Match: 90%+</option>
            </select>

            {/* Reset */}
            <button onClick={resetFilters} className="btn btn-secondary btn-sm" title="Reset Filters" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          {/* Min Match Controls & Quick Presets */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            {/* Slider & Display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SlidersHorizontal size={14} /> Min Match:
              </span>
              <input
                type="range"
                min="0"
                max="95"
                step="5"
                value={minMatchPct}
                onInput={(e) => setMinMatchPct(Number(e.target.value))}
                onChange={(e) => setMinMatchPct(Number(e.target.value))}
                style={{ width: '160px', accentColor: 'var(--primary-600)', cursor: 'pointer' }}
              />
              <span style={{
                display: 'inline-block',
                minWidth: '44px',
                textAlign: 'center',
                padding: '2px 8px',
                backgroundColor: minMatchPct > 0 ? 'var(--primary-50)' : 'var(--bg-secondary)',
                color: minMatchPct > 0 ? 'var(--primary-700)' : 'var(--text-primary)',
                border: minMatchPct > 0 ? '1px solid var(--primary-300)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '700',
                fontSize: '0.82rem'
              }}>
                {minMatchPct}%
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>Presets:</span>
              {[0, 50, 60, 65, 70, 75, 80].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMinMatchPct(val)}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.75rem',
                    fontWeight: minMatchPct === val ? '700' : '500',
                    borderRadius: 'var(--radius-sm)',
                    border: minMatchPct === val ? '1px solid var(--primary-600)' : '1px solid var(--border-subtle)',
                    backgroundColor: minMatchPct === val ? 'var(--primary-600)' : 'var(--bg-primary)',
                    color: minMatchPct === val ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {val === 0 ? 'All' : `${val}%+`}
                </button>
              ))}
            </div>

            {/* Count & Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {minMatchPct > 0 && (
                <span
                  onClick={() => setMinMatchPct(0)}
                  className="badge badge-primary"
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                  title="Click to clear min match"
                >
                  ≥ {minMatchPct}% <X size={11} />
                </span>
              )}
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                Showing <strong>{filteredRecommendations.length}</strong> of {recommendations.length}
              </span>
            </div>
          </div>
        </div>

        {/* Results List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
            Loading recommended opportunities...
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Briefcase size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>No matches found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              {minMatchPct > 0
                ? `No opportunities match your filter of ${minMatchPct}% or higher. Try lowering the minimum match percentage.`
                : 'Try adjusting your search criteria or adding more skills in your profile.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              {minMatchPct > 0 && (
                <button onClick={() => setMinMatchPct(0)} className="btn btn-primary btn-sm">
                  Show All Matches (Reset Min Match)
                </button>
              )}
              <button onClick={resetFilters} className="btn btn-secondary btn-sm">
                Reset All Filters
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredRecommendations.map((opp) => {
              const isExpanded = expandedBreakdown[opp.id];
              const scoreBreakdown = opp.score_breakdown || {};
              const matchingSkills = parseSkills(opp.matching_skills);
              const missingSkills = parseSkills(opp.missing_skills);

              return (
                <div key={opp.id} className="card" style={{ padding: '20px 24px' }}>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <span className="badge badge-primary">{opp.domain}</span>
                        <span className="badge badge-neutral">{opp.opportunity_type || 'Internship'}</span>
                        <span className="badge badge-neutral">{opp.work_mode || 'Hybrid'}</span>
                      </div>

                      <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {opp.title}
                      </h2>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          <Building2 size={14} color="var(--primary-600)" />
                          <span>{opp.company || opp.company_name}</span>
                        </div>
                        <span>•</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} />
                          <span>{opp.location || 'Remote'}</span>
                        </div>
                        <span>•</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <DollarSign size={13} />
                          <span>{opp.stipend_or_salary || 'Competitive'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span className={`match-score-pill ${getMatchBadgeClass(getMatchPercentage(opp))}`} style={{ fontSize: '0.98rem', padding: '6px 14px' }}>
                        <Sparkles size={14} /> {getMatchPercentage(opp)}% Match
                      </span>
                      <button
                        onClick={() => toggleBreakdown(opp.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--primary-600)',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        {isExpanded ? 'Hide score' : 'Why this match?'} {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </div>
                  </div>

                  {/* Score Breakdown Drawer */}
                  {isExpanded && (
                    <div style={{
                      padding: '12px 16px',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '14px',
                      fontSize: '0.82rem'
                    }}>
                      <div style={{ fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
                        Match Calculation:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', textAlign: 'center' }}>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Skills (50%)</div>
                          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                            {scoreBreakdown.skill_match ?? opp.skill_match_percentage ?? 0}%
                          </div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Interest (20%)</div>
                          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                            {scoreBreakdown.interest_match ?? 0}%
                          </div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Projects (10%)</div>
                          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                            {scoreBreakdown.project_match ?? scoreBreakdown.project_tfidf_match ?? 0}%
                          </div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>CGPA (10%)</div>
                          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                            {scoreBreakdown.qualification_match ?? 0}%
                          </div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Mode (10%)</div>
                          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                            {scoreBreakdown.preference_match ?? 0}%
                          </div>
                        </div>
                      </div>

                      {opp.explanation && (
                        <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          <strong>Recommendation Rationale:</strong> {opp.explanation}
                          {opp.explanation_details && opp.explanation_details.length > 0 && (
                            <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                              {opp.explanation_details.map((detail, dIdx) => (
                                <li key={dIdx} style={{ color: detail.startsWith('✓') ? 'var(--success-700)' : 'var(--danger-600)' }}>
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Skills Alignment Preview */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                    {/* Matching Skills */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--success-700)', minWidth: '100px' }}>
                        ✓ Matched ({matchingSkills.length}):
                      </span>
                      {matchingSkills.length > 0 ? (
                        matchingSkills.map((s, idx) => (
                          <span key={idx} className="skill-tag matched" style={{ fontSize: '0.78rem', padding: '2px 8px' }}>
                            ✓ {s}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None matched yet</span>
                      )}
                    </div>

                    {/* Missing Skills */}
                    {missingSkills.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--danger-600)', minWidth: '100px' }}>
                          ✗ Missing ({missingSkills.length}):
                        </span>
                        {missingSkills.map((s, idx) => (
                          <span key={idx} className="skill-tag missing" style={{ fontSize: '0.78rem', padding: '2px 8px' }}>
                            ✗ {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                      onClick={() => setSelectedOpportunity(opp)}
                      className="btn btn-secondary btn-sm"
                    >
                      View Details
                    </button>

                    {appliedMap[opp.opportunity_id || opp.id] ? (
                      <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', fontSize: '0.82rem' }}>
                        <CheckCircle2 size={14} /> Applied ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => setApplyingOpportunity(opp)}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        Apply to Company <Send size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Opportunity Details Modal */}
      {selectedOpportunity && (
        <OpportunityDetailsModal
          opportunity={selectedOpportunity}
          studentSkills={studentSkills}
          isApplied={!!appliedMap[selectedOpportunity?.opportunity_id || selectedOpportunity?.id]}
          onApply={(opp) => {
            setSelectedOpportunity(null);
            setApplyingOpportunity(opp);
          }}
          onClose={() => setSelectedOpportunity(null)}
        />
      )}

      {/* Direct In-App Company Application Modal */}
      {applyingOpportunity && (
        <ApplyModal
          opportunity={applyingOpportunity}
          studentProfile={studentProfile}
          onClose={() => setApplyingOpportunity(null)}
          onAppliedSuccess={(oppId) => {
            setAppliedMap(prev => ({ ...prev, [oppId]: true }));
          }}
        />
      )}
    </div>
  );
};

export default RecommendationsPage;

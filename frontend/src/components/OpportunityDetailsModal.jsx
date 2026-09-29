import React from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';

const OpportunityDetailsModal = ({ opportunity, studentSkills = [], onClose, onApply, isApplied = false }) => {
  if (!opportunity) return null;

  const matchPct = opportunity.match_percentage !== undefined ? opportunity.match_percentage : null;

  // Compute matching vs missing skills if not directly on the object
  const parseSkills = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(s => (typeof s === 'object' ? (s.skill_name || s.name || '') : String(s))).filter(Boolean);
    return String(raw).split(/[,|/]+/).map(s => s.trim()).filter(Boolean);
  };

  const required = parseSkills(opportunity.required_skills);
  const preferred = parseSkills(opportunity.preferred_skills);

  const studentSkillsNorm = studentSkills.map(s => {
    if (typeof s === 'string') return s.toLowerCase().trim();
    if (s && typeof s === 'object') return (s.skill_name || s.name || '').toLowerCase().trim();
    return String(s || '').toLowerCase().trim();
  }).filter(Boolean);

  const parsedMatching = parseSkills(opportunity.matching_skills);
  const parsedMissing = parseSkills(opportunity.missing_skills);

  const matching = parsedMatching.length > 0
    ? parsedMatching
    : required.filter(s => studentSkillsNorm.includes(s.toLowerCase()));

  const missing = parsedMissing.length > 0
    ? parsedMissing
    : required.filter(s => !studentSkillsNorm.includes(s.toLowerCase()));

  const getMatchClass = (score) => {
    if (score >= 75) return 'match-high';
    if (score >= 50) return 'match-mid';
    return 'match-low';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-primary">{opportunity.domain || 'General Tech'}</span>
              <span className="badge badge-neutral">{opportunity.opportunity_type || 'Internship'}</span>
              <span className="badge badge-neutral">{opportunity.work_mode || 'Hybrid'}</span>
            </div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
              {opportunity.title}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <Building2 size={16} color="var(--primary-600)" />
              <strong style={{ color: 'var(--text-primary)' }}>{opportunity.company || opportunity.company_name}</strong>
              <span>•</span>
              <MapPin size={15} />
              <span>{opportunity.location || 'Remote'}</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Match Percentage Banner if available */}
        {matchPct !== null && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <Sparkles size={20} color="var(--primary-600)" />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                  AI Profile Match Score
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {matchPct}% Alignment with your profile
                </div>
              </div>
            </div>

            <span className={`match-score-pill ${getMatchClass(matchPct)}`}>
              {matchPct}% Match
            </span>
          </div>
        )}

        {/* Key Highlights Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <DollarSign size={14} /> Compensation
            </div>
            <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
              {opportunity.stipend_or_salary || 'Competitive'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <GraduationCap size={14} /> Min. CGPA Requirement
            </div>
            <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
              {opportunity.minimum_cgpa > 0 ? `${opportunity.minimum_cgpa} / 10.0` : 'No Cutoff'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Layers size={14} /> Target Qualification
            </div>
            <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
              {opportunity.qualification || 'B.Tech / B.E / B.Sc / BCA'}
            </div>
          </div>
        </div>

        {/* Role Description */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
            Role Description & Responsibilities
          </h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
            {opportunity.description || 'Join this leading engineering organization to work on production-grade systems, contribute to codebases, and collaborate with experienced industry mentors.'}
          </p>
        </div>

        {/* Skills Evaluation: Matching vs Missing */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>
            Skills Breakdown
          </h4>

          {/* Matching Skills */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--success-700)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <CheckCircle2 size={16} /> Skills You Have ({matching.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {matching.length > 0 ? (
                matching.map((s, idx) => (
                  <span key={idx} className="skill-tag matched">
                    ✓ {s}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>None matched yet</span>
              )}
            </div>
          </div>

          {/* Missing Skills */}
          {missing.length > 0 && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--danger-600)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <XCircle size={16} /> Missing Required Skills ({missing.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {missing.map((s, idx) => (
                  <span key={idx} className="skill-tag missing">
                    ✗ {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preferred Skills */}
        {preferred.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <h5 style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Good-to-Have / Preferred Skills
            </h5>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {preferred.map((s, idx) => (
                <span key={idx} className="skill-tag">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', alignItems: 'center' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          {isApplied ? (
            <span className="badge badge-success" style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> Applied ✓
            </span>
          ) : (
            <button
              onClick={() => {
                if (onApply) {
                  onApply(opportunity);
                } else if (opportunity.application_link && !opportunity.application_link.includes('example.com')) {
                  window.open(opportunity.application_link, '_blank', 'noopener,noreferrer');
                } else {
                  window.open(`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(opportunity.title || 'Internship')}&location=${encodeURIComponent(opportunity.location || 'India')}`, '_blank', 'noopener,noreferrer');
                }
              }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Apply to Company <ExternalLink size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetailsModal;

import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Send, 
  ExternalLink, 
  FileText, 
  Phone, 
  Globe
} from 'lucide-react';
import { applicationService } from '../services/api';

const ApplyModal = ({ opportunity, studentProfile, onClose, onAppliedSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Default pre-filled fields
  const [phone, setPhone] = useState(studentProfile?.phone || '');
  const [portfolioUrl, setPortfolioUrl] = useState(studentProfile?.portfolio_url || 'https://github.com');
  const [coverNote, setCoverNote] = useState(
    `I am excited to apply for the ${opportunity?.title || 'Internship'} position at ${opportunity?.company || opportunity?.company_name || 'your organization'}. My background in ${opportunity?.domain || 'this field'} and proficiency in core technical skills align strongly with this role.`
  );

  if (!opportunity) return null;

  const companyName = opportunity.company || opportunity.company_name || 'Hiring Company';
  const matchPct = opportunity.match_percentage || opportunity.final_score || 0;
  const matchingSkills = opportunity.matching_skills || [];

  // Generate realistic LinkedIn jobs search URL based on title and location
  const realExternalUrl = opportunity.application_link && !opportunity.application_link.includes('example.com')
    ? opportunity.application_link
    : `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(opportunity.title || 'Internship')}&location=${encodeURIComponent(opportunity.location || 'India')}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        opportunity_id: opportunity.opportunity_id || opportunity.id,
        student_id: studentProfile?.id || 1,
        student_name: studentProfile?.name || 'Student Applicant',
        student_email: studentProfile?.email || 'student@careermatch.ai',
        contact_phone: phone,
        portfolio_url: portfolioUrl,
        cover_note: coverNote
      };

      const res = await applicationService.apply(payload);
      const appData = res.data.application || {
        reference_number: `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Under Review'
      };

      setSubmittedData(appData);
      if (onAppliedSuccess) {
        onAppliedSuccess(opportunity.opportunity_id || opportunity.id, appData);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="card" style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '620px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        padding: '28px',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '18px',
            top: '18px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%'
          }}
        >
          <X size={20} />
        </button>

        {/* Submitted Success View */}
        {submittedData ? (
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#ecfdf5',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#059669'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Application Submitted to {companyName}!
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '20px', lineHeight: '1.5' }}>
              Your profile, academic record, and matched technical skills have been received by the <strong>{companyName}</strong> recruitment team.
            </p>

            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'left',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Role Applied:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{opportunity.title}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Reference Number:</span>
                <strong style={{ color: 'var(--primary-600)' }}>{submittedData.reference_number || 'APP-2026-0001'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Application Status:</span>
                <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                  {submittedData.status || 'Under Review'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button onClick={onClose} className="btn btn-primary" style={{ padding: '8px 24px' }}>
                Done
              </button>
              <a
                href={realExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                View on LinkedIn Jobs <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ) : (
          /* Application Form View */
          <div>
            {/* Header info */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-primary">{opportunity.domain || 'Technology'}</span>
                <span className="badge badge-neutral">{opportunity.opportunity_type || 'Internship'}</span>
                <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} /> {matchPct}% Match
                </span>
              </div>

              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Apply for {opportunity.title}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  <Building2 size={14} color="var(--primary-600)" />
                  <span>{companyName}</span>
                </div>
                <span>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} />
                  <span>{opportunity.location || 'Remote'}</span>
                </div>
                <span>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DollarSign size={13} />
                  <span>{opportunity.stipend_or_salary || 'Competitive'}</span>
                </div>
              </div>
            </div>

            {/* Candidate Pre-fill Highlight */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: '18px',
              fontSize: '0.84rem'
            }}>
              <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} color="var(--primary-600)" />
                Applicant Profile Details:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', color: 'var(--text-secondary)' }}>
                <div>Name: <strong>{studentProfile?.name || 'Alex Johnson'}</strong></div>
                <div>Email: <strong>{studentProfile?.email || 'student@careermatch.ai'}</strong></div>
                <div>CGPA: <strong>{studentProfile?.cgpa || '8.45'} / 10.0</strong></div>
                <div>Department: <strong>{studentProfile?.department || 'Information Technology'}</strong></div>
              </div>

              {/* Matched skills highlight */}
              {matchingSkills.length > 0 && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--success-700)', fontWeight: '700' }}>
                    ✓ Matched Skills Forwarded:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {matchingSkills.map((s, idx) => (
                      <span key={idx} className="skill-tag matched" style={{ fontSize: '0.74rem', padding: '1px 6px' }}>
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {errorMsg && (
              <div style={{
                padding: '10px 14px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '14px',
                fontSize: '0.85rem'
              }}>
                {errorMsg}
              </div>
            )}

            {/* Application Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '600' }}>
                  <Phone size={13} /> Contact Phone Number:
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '600' }}>
                  <Globe size={13} /> GitHub / LinkedIn / Portfolio Link:
                </label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://github.com/your-username"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  style={{ fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '600' }}>
                  <FileText size={13} /> Statement of Interest / Note to Hiring Team:
                </label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  style={{ fontSize: '0.86rem', lineHeight: '1.4' }}
                />
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <a
                  href={realExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.82rem', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  title="Search real live openings on LinkedIn"
                >
                  Apply via LinkedIn <ExternalLink size={12} />
                </a>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={submitting}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={submitting}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {submitting ? 'Submitting...' : <>Submit Application <Send size={13} /></>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyModal;

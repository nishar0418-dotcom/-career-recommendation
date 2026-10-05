import React, { useState, useEffect } from 'react';
import { opportunityService, studentService, applicationService } from '../services/api';
import OpportunityDetailsModal from '../components/OpportunityDetailsModal';
import ApplyModal from '../components/ApplyModal';
import { 
  Search, 
  Building2, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  RotateCcw, 
  CheckCircle2, 
  Send
} from 'lucide-react';

const OpportunitySearchPage = () => {
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState([]);
  const [studentSkills, setStudentSkills] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [applyingOpportunity, setApplyingOpportunity] = useState(null);
  const [appliedMap, setAppliedMap] = useState({});

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('All');
  const [workModeFilter, setWorkModeFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [oppRes, profRes, appRes] = await Promise.all([
        opportunityService.getOpportunities(),
        studentService.getProfile().catch(() => ({ data: {} })),
        applicationService.getApplications().catch(() => ({ data: { applications: [] } }))
      ]);
      setOpportunities(oppRes.data.opportunities || []);
      const profileData = profRes.data || {};
      setStudentProfile(profileData);
      setStudentSkills(profileData.skills || []);

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

  const resetFilters = () => {
    setSearchTerm('');
    setDomainFilter('All');
    setWorkModeFilter('All');
    setTypeFilter('All');
  };

  const filteredOpportunities = opportunities.filter(opp => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const titleMatch = opp.title?.toLowerCase().includes(term);
      const companyMatch = (opp.company || opp.company_name)?.toLowerCase().includes(term);
      const skillsMatch = opp.required_skills?.toLowerCase().includes(term);
      const descMatch = opp.description?.toLowerCase().includes(term);
      if (!titleMatch && !companyMatch && !skillsMatch && !descMatch) return false;
    }

    if (domainFilter !== 'All' && !opp.domain?.toLowerCase().includes(domainFilter.toLowerCase())) {
      return false;
    }

    if (workModeFilter !== 'All' && !opp.work_mode?.toLowerCase().includes(workModeFilter.toLowerCase())) {
      return false;
    }

    if (typeFilter !== 'All' && !opp.opportunity_type?.toLowerCase().includes(typeFilter.toLowerCase())) {
      return false;
    }

    return true;
  });

  return (
    <div style={{ padding: '40px 0 80px 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-primary">Opportunity Catalog</span>
            <span className="badge badge-neutral">{opportunities.length} Verified Listings</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--text-primary)' }}>
            Explore Internships & Tech Roles
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Search verified internships and full-time technical jobs across high-growth startups and enterprise tech companies.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="card" style={{ padding: '20px 24px', marginBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '14px', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search job title, company, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>

            {/* Domain */}
            <select
              className="form-select"
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
            >
              <option value="All">All Domains</option>
              <option value="Data Science">Data Science</option>
              <option value="Artificial Intelligence">AI / ML</option>
              <option value="Web Development">Web Development</option>
              <option value="Full Stack">Full Stack</option>
              <option value="Cloud Computing">Cloud Computing</option>
              <option value="Cyber Security">Cyber Security</option>
            </select>

            {/* Work Mode */}
            <select
              className="form-select"
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value)}
            >
              <option value="All">All Work Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>

            {/* Type */}
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Internship">Internship</option>
              <option value="Job">Full-time Job</option>
            </select>

            {/* Reset */}
            <button onClick={resetFilters} className="btn btn-secondary" title="Reset Filters">
              <RotateCcw size={15} /> Reset
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Showing <strong>{filteredOpportunities.length}</strong> opportunities</span>
        </div>

        {/* Opportunities List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Loading opportunity catalog...
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <Briefcase size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ marginBottom: '6px' }}>No opportunities found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <div className="grid-2">
            {filteredOpportunities.map((opp) => (
              <div key={opp.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span className="badge badge-primary">{opp.domain}</span>
                      <span className="badge badge-neutral">{opp.opportunity_type || 'Internship'}</span>
                      <span className="badge badge-neutral">{opp.work_mode || 'Hybrid'}</span>
                    </div>
                  </div>

                  <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {opp.title}
                  </h2>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '14px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      <Building2 size={15} color="var(--primary-600)" />
                      <span>{opp.company || opp.company_name}</span>
                    </div>
                    <span>•</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} />
                      <span>{opp.location || 'Remote'}</span>
                    </div>
                    <span>•</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <DollarSign size={14} />
                      <span>{opp.stipend_or_salary || 'Competitive'}</span>
                    </div>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {opp.description}
                  </p>

                  {/* Required Skills Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                    {opp.required_skills?.split(',').map((s, idx) => (
                      <span key={idx} className="skill-tag" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => setSelectedOpportunity(opp)}
                    className="btn btn-secondary btn-sm"
                  >
                    View Details
                  </button>

                  {appliedMap[opp.id] ? (
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
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedOpportunity && (
        <OpportunityDetailsModal
          opportunity={selectedOpportunity}
          studentSkills={studentSkills}
          isApplied={!!appliedMap[selectedOpportunity?.id]}
          onApply={(opp) => {
            setSelectedOpportunity(null);
            setApplyingOpportunity(opp);
          }}
          onClose={() => setSelectedOpportunity(null)}
        />
      )}

      {/* Direct Apply Modal */}
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

export default OpportunitySearchPage;

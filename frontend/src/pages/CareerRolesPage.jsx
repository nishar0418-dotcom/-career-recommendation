import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recommendationService } from '../services/api';
import { Compass, Sparkles, CheckCircle2, XCircle, BookOpen, Search, ArrowRight } from 'lucide-react';

const CareerRolesPage = () => {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  useEffect(() => {
    fetchCareerRoles();
  }, []);

  const fetchCareerRoles = async () => {
    setLoading(true);
    try {
      const res = await recommendationService.getCareerRoles();
      setRoles(res.data.career_roles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(role => {
    if (searchQuery && !role.role.toLowerCase().includes(searchQuery.toLowerCase()) && !role.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedDomain !== 'All' && !role.domain.toLowerCase().includes(selectedDomain.toLowerCase())) {
      return false;
    }
    return true;
  });

  const domains = ['All', 'Data Science', 'Artificial Intelligence', 'Web Development', 'Software Development', 'Full Stack Development', 'Cloud Computing', 'Cyber Security'];

  return (
    <div style={{ padding: '40px 0 80px 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-purple">Industry Archetypes</span>
            <span className="badge badge-primary">Suitability Calibrated</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--text-primary)' }}>
            Career Role Suitability Explorer
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Benchmark your current technical profile against standard industry archetypes to see which paths offer the highest natural fit.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="card" style={{ padding: '18px 24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            {/* Search */}
            <div style={{ position: 'relative', minWidth: '280px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search career roles or domains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>

            {/* Domain Filter Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {domains.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDomain(d)}
                  className={`btn btn-sm ${selectedDomain === d ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.8rem' }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Roles Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Benchmarking career archetypes...
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No career roles matched your search criteria.</p>
          </div>
        ) : (
          <div className="grid-2">
            {filteredRoles.map((r, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '28px' }}>
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <span className="badge badge-primary" style={{ marginBottom: '6px' }}>
                        {r.domain}
                      </span>
                      <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>
                        {r.role}
                      </h2>
                    </div>

                    <span className={`match-score-pill ${r.suitability >= 75 ? 'match-high' : r.suitability >= 50 ? 'match-mid' : 'match-low'}`} style={{ fontSize: '1rem' }}>
                      <Sparkles size={15} /> {r.suitability}% Suitability
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '20px' }}>
                    {r.description}
                  </p>

                  {/* Skills Alignment */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Required Tech Competencies
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {r.matching_skills.map((s, sIdx) => (
                        <span key={sIdx} className="skill-tag matched" style={{ fontSize: '0.82rem' }}>
                          ✓ {s}
                        </span>
                      ))}
                      {r.missing_skills.map((s, sIdx) => (
                        <span key={sIdx} className="skill-tag missing" style={{ fontSize: '0.82rem' }}>
                          ✗ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Curated Learning Suggestion */}
                  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Recommended Next Step
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: '1.5' }}>
                      {r.recommended_learning}
                    </p>
                  </div>
                </div>

                {/* Footer Link */}
                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    {r.matching_skills.length} of {r.required_skills.length} skills matched
                  </span>
                  <Link
                    to={`/recommendations?domain=${encodeURIComponent(r.domain)}`}
                    className="btn btn-outline btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    View {r.role} Openings <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerRolesPage;

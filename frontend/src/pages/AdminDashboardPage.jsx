import React, { useState, useEffect } from 'react';
import { adminService, opportunityService } from '../services/api';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  X,
  MapPin
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [opportunities, setOpportunities] = useState([]);

  // Add/Edit Opportunity Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalForm, setModalForm] = useState({
    title: '',
    company: '',
    domain: 'Data Science',
    description: '',
    required_skills: '',
    preferred_skills: '',
    minimum_cgpa: '0.0',
    location: 'Bangalore',
    opportunity_type: 'Internship',
    work_mode: 'Hybrid',
    stipend_or_salary: '₹25,000 / month',
    application_link: 'https://linkedin.com'
  });

  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, studentsRes, oppsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getStudents(),
        opportunityService.getOpportunities()
      ]);

      setStats(statsRes.data);
      setStudents(studentsRes.data.students || []);
      setOpportunities(oppsRes.data.opportunities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setModalForm({
      title: '',
      company: '',
      domain: 'Data Science',
      description: '',
      required_skills: '',
      preferred_skills: '',
      minimum_cgpa: '0.0',
      location: 'Bangalore',
      opportunity_type: 'Internship',
      work_mode: 'Hybrid',
      stipend_or_salary: '₹25,000 / month',
      application_link: 'https://linkedin.com'
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (opp) => {
    setEditingId(opp.id);
    setModalForm({
      title: opp.title || '',
      company: opp.company || opp.company_name || '',
      domain: opp.domain || 'Data Science',
      description: opp.description || '',
      required_skills: opp.required_skills || '',
      preferred_skills: opp.preferred_skills || '',
      minimum_cgpa: opp.minimum_cgpa || '0.0',
      location: opp.location || 'Remote',
      opportunity_type: opp.opportunity_type || 'Internship',
      work_mode: opp.work_mode || 'Hybrid',
      stipend_or_salary: opp.stipend_or_salary || '',
      application_link: opp.application_link || ''
    });
    setShowModal(true);
  };

  const handleSaveOpportunity = async (e) => {
    e.preventDefault();
    setFeedbackMsg('');
    setFeedbackError('');

    try {
      if (editingId) {
        await opportunityService.updateOpportunity(editingId, modalForm);
        setFeedbackMsg('Opportunity updated successfully.');
      } else {
        await opportunityService.createOpportunity(modalForm);
        setFeedbackMsg('New opportunity published successfully.');
      }
      setShowModal(false);
      loadAdminData();
    } catch (err) {
      console.error(err);
      setFeedbackError(err.response?.data?.error || 'Failed to save opportunity.');
    }
  };

  const handleDeleteOpportunity = async (id) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      await opportunityService.deleteOpportunity(id);
      setFeedbackMsg('Opportunity removed.');
      loadAdminData();
    } catch (err) {
      console.error(err);
      setFeedbackError('Failed to delete opportunity.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading administrator metrics and management console...</p>
      </div>
    );
  }

  const { stats: counts = {}, domain_distribution = [] } = stats || {};

  return (
    <div style={{ padding: '40px 0 80px 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> Administrator Portal
              </span>
              <span className="badge badge-success">Live Management</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--text-primary)' }}>
              Platform Overview & Opportunity Management
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage opportunities, monitor registered students, and review talent analytics across departments.
            </p>
          </div>

          <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Post New Opportunity
          </button>
        </div>

        {/* Feedback Notifications */}
        {feedbackMsg && (
          <div style={{ padding: '12px 16px', backgroundColor: 'var(--success-50)', color: 'var(--success-700)', border: '1px solid var(--success-100)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            ✓ {feedbackMsg}
          </div>
        )}
        {feedbackError && (
          <div style={{ padding: '12px 16px', backgroundColor: 'var(--danger-50)', color: 'var(--danger-600)', border: '1px solid var(--danger-100)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            ✗ {feedbackError}
          </div>
        )}

        {/* 4 Stats Cards */}
        <div className="grid-4" style={{ marginBottom: '32px' }}>
          <div className="stat-widget">
            <div className="stat-icon blue">
              <Users size={24} />
            </div>
            <div>
              <div className="stat-value">{counts.total_students || 0}</div>
              <div className="stat-label">Registered Students</div>
            </div>
          </div>

          <div className="stat-widget">
            <div className="stat-icon green">
              <Briefcase size={24} />
            </div>
            <div>
              <div className="stat-value">{counts.total_opportunities || 0}</div>
              <div className="stat-label">Active Opportunities</div>
            </div>
          </div>

          <div className="stat-widget">
            <div className="stat-icon purple">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="stat-value">{counts.total_recommendations || 0}</div>
              <div className="stat-label">AI Match Records</div>
            </div>
          </div>

          <div className="stat-widget">
            <div className="stat-icon amber">
              <Layers size={24} />
            </div>
            <div>
              <div className="stat-value">{counts.total_skills_catalog || 0}</div>
              <div className="stat-label">Master Skills Catalog</div>
            </div>
          </div>
        </div>

        {/* Domain Distribution */}
        {domain_distribution.length > 0 && (
          <div className="card" style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '14px' }}>
              Opportunities by Technology Domain
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {domain_distribution.map((dom, idx) => (
                <div key={idx} style={{ padding: '8px 16px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{dom.domain}</span>
                  <span className="badge badge-primary">{dom.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opportunities Management Table */}
        <div className="card" style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Managed Opportunities ({opportunities.length})</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Create, update or remove vacancies available to students</p>
            </div>
            <button onClick={handleOpenAddModal} className="btn btn-secondary btn-sm">
              <Plus size={15} /> Add Opportunity
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title & Company</th>
                  <th>Domain</th>
                  <th>Work Mode</th>
                  <th>Min CGPA</th>
                  <th>Required Skills</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp) => (
                  <tr key={opp.id}>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{opp.title}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{opp.company || opp.company_name} • {opp.location}</div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{opp.domain}</span>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{opp.work_mode || 'Hybrid'}</span>
                    </td>
                    <td>
                      <strong>{opp.minimum_cgpa > 0 ? opp.minimum_cgpa : 'None'}</strong>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {opp.required_skills}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleOpenEditModal(opp)} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} title="Edit">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDeleteOpportunity(opp.id)} className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Registered Students Table */}
        <div className="card">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Registered Students ({students.length})</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Monitor profiles, competency logging, and engagement status</p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name & Email</th>
                  <th>Department & Year</th>
                  <th>CGPA</th>
                  <th>Skills Count</th>
                  <th>Projects</th>
                  <th>Profile Completion</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st.id}>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{st.name}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{st.email}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{st.department || 'General Engineering'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{st.year_of_study || 'Student'}</div>
                    </td>
                    <td>
                      <strong>{st.cgpa ? `${st.cgpa}` : 'Not set'}</strong>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{st.skills_count || 0} skills</span>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{st.projects_count || 0} projects</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="progress-bar-bg" style={{ width: '80px' }}>
                          <div className="progress-bar-fill" style={{ width: `${st.profile_completion}%`, backgroundColor: st.profile_completion >= 70 ? 'var(--success-600)' : 'var(--primary-600)' }} />
                        </div>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>{st.profile_completion}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem' }}>
                {editingId ? 'Edit Opportunity' : 'Create New Opportunity'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveOpportunity}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Job / Internship Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. AI Engineer Intern"
                    value={modalForm.title}
                    onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Google / Microsoft"
                    value={modalForm.company}
                    onChange={(e) => setModalForm({ ...modalForm, company: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Technology Domain</label>
                  <select
                    className="form-select"
                    value={modalForm.domain}
                    onChange={(e) => setModalForm({ ...modalForm, domain: e.target.value })}
                  >
                    <option value="Data Science">Data Science</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Full Stack Development">Full Stack Development</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="Mobile App Development">Mobile App Development</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Opportunity Type</label>
                  <select
                    className="form-select"
                    value={modalForm.opportunity_type}
                    onChange={(e) => setModalForm({ ...modalForm, opportunity_type: e.target.value })}
                  >
                    <option value="Internship">Internship</option>
                    <option value="Job">Full-time Job</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Work Mode</label>
                  <select
                    className="form-select"
                    value={modalForm.work_mode}
                    onChange={(e) => setModalForm({ ...modalForm, work_mode: e.target.value })}
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Required Skills (Comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Python, SQL, Machine Learning, Scikit-learn"
                  value={modalForm.required_skills}
                  onChange={(e) => setModalForm({ ...modalForm, required_skills: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role Description</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="Summarize the core duties, mentorship, and expectations..."
                  value={modalForm.description}
                  onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Min. CGPA Cutoff</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    className="form-input"
                    value={modalForm.minimum_cgpa}
                    onChange={(e) => setModalForm({ ...modalForm, minimum_cgpa: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={modalForm.location}
                    onChange={(e) => setModalForm({ ...modalForm, location: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stipend / Salary</label>
                  <input
                    type="text"
                    className="form-input"
                    value={modalForm.stipend_or_salary}
                    onChange={(e) => setModalForm({ ...modalForm, stipend_or_salary: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Application URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={modalForm.application_link}
                  onChange={(e) => setModalForm({ ...modalForm, application_link: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Save Changes' : 'Publish Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;

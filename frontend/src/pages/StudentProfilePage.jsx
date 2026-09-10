import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Sparkles, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Layers, 
  Award, 
  Briefcase, 
  FolderGit2, 
  MapPin, 
  Sliders,
  AlertCircle
} from 'lucide-react';

const StudentProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile fields
  const [cgpa, setCgpa] = useState('8.0');
  const [preferredDomain, setPreferredDomain] = useState('Data Science');
  const [preferredLocation, setPreferredLocation] = useState('Bangalore');
  const [opportunityType, setOpportunityType] = useState('Both');
  const [workMode, setWorkMode] = useState('Hybrid');

  // Interests
  const allInterests = [
    'Data Science',
    'Artificial Intelligence / Machine Learning',
    'Web Development (Frontend & Backend)',
    'Full Stack Engineering',
    'Cloud Computing & DevOps',
    'Cyber Security & Networking',
    'Mobile Application Development'
  ];
  const [selectedInterests, setSelectedInterests] = useState([]);

  // Skills
  const [masterSkillsCatalog, setMasterSkillsCatalog] = useState({});
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState('');

  // Projects
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ project_name: '', description: '', technologies: '' });
  const [showAddProject, setShowAddProject] = useState(false);

  // Certifications
  const [certifications, setCertifications] = useState([]);
  const [newCert, setNewCert] = useState({ certification_name: '', organization: '' });
  const [showAddCert, setShowAddCert] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Profile
      const profileRes = await studentService.getProfile();
      const data = profileRes.data;

      setCgpa(data.profile.cgpa || '8.0');
      setPreferredDomain(data.profile.preferred_domain || 'Data Science');
      setPreferredLocation(data.profile.preferred_location || 'Bangalore');
      setOpportunityType(data.profile.opportunity_type || 'Both');
      setWorkMode(data.profile.work_mode || 'Hybrid');

      if (data.profile.interests) {
        setSelectedInterests(data.profile.interests.split(',').map(s => s.trim()).filter(Boolean));
      }

      // Format skills
      if (data.skills_detailed && data.skills_detailed.length > 0) {
        setSelectedSkills(data.skills_detailed.map(s => ({
          name: s.skill_name,
          proficiency: s.proficiency || 'Intermediate'
        })));
      } else if (data.skills) {
        setSelectedSkills(data.skills.map(s => ({ name: s, proficiency: 'Intermediate' })));
      }

      setProjects(data.projects || []);
      setCertifications(data.certifications || []);

      // 2. Fetch Master Skills
      const catalogRes = await studentService.getSkillsCatalog();
      setMasterSkillsCatalog(catalogRes.data.categories || {});
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  // Skill management
  const toggleSkill = (skillName) => {
    const exists = selectedSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
    if (exists) {
      setSelectedSkills(selectedSkills.filter(s => s.name.toLowerCase() !== skillName.toLowerCase()));
    } else {
      setSelectedSkills([...selectedSkills, { name: skillName, proficiency: 'Intermediate' }]);
    }
  };

  const addCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    const exists = selectedSkills.find(s => s.name.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      setSelectedSkills([...selectedSkills, { name: trimmed, proficiency: 'Intermediate' }]);
    }
    setCustomSkillInput('');
  };

  const removeSkill = (skillName) => {
    setSelectedSkills(selectedSkills.filter(s => s.name !== skillName));
  };

  const updateSkillProficiency = (skillName, newProf) => {
    setSelectedSkills(selectedSkills.map(s => s.name === skillName ? { ...s, proficiency: newProf } : s));
  };

  // Interest management
  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // Project management
  const handleAddProject = () => {
    if (!newProject.project_name.trim()) return;
    setProjects([...projects, { ...newProject, id: Date.now() }]);
    setNewProject({ project_name: '', description: '', technologies: '' });
    setShowAddProject(false);
  };

  const handleDeleteProject = (index) => {
    setProjects(projects.filter((_, idx) => idx !== index));
  };

  // Certification management
  const handleAddCert = () => {
    if (!newCert.certification_name.trim()) return;
    setCertifications([...certifications, { ...newCert, id: Date.now() }]);
    setNewCert({ certification_name: '', organization: '' });
    setShowAddCert(false);
  };

  const handleDeleteCert = (index) => {
    setCertifications(certifications.filter((_, idx) => idx !== index));
  };

  // Save Profile
  const handleSave = async (runAnalysisAfter = false) => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const formattedSkills = selectedSkills.map(s => ({
        skill_name: (s.name || s.skill_name || (typeof s === 'string' ? s : '')).trim(),
        name: (s.name || s.skill_name || (typeof s === 'string' ? s : '')).trim(),
        proficiency: s.proficiency || 'Intermediate'
      })).filter(s => s.skill_name.length > 0);

      await studentService.updateProfile({
        cgpa: parseFloat(cgpa) || 0.0,
        interests: selectedInterests.join(', '),
        preferred_domain: preferredDomain,
        preferred_location: preferredLocation,
        opportunity_type: opportunityType,
        work_mode: workMode,
        skills: formattedSkills,
        projects: projects,
        certifications: certifications,
      });

      setSuccessMsg('Profile saved! Skills updated for recommendations.');
      setTimeout(() => setSuccessMsg(''), 6000);

      if (runAnalysisAfter) {
        navigate('/ai-analysis');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save profile. Please check your inputs.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 0 60px 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-primary">Student Profile</span>
              <span className="badge badge-neutral">{user?.department || 'Engineering'}</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
              My Skills & Profile
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Add your skills to get matched with internships and jobs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => handleSave(false)} 
              className="btn btn-secondary" 
              disabled={saving}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
            <button 
              onClick={() => handleSave(true)} 
              className="btn btn-primary" 
              disabled={saving}
            >
              <Sparkles size={16} /> Save & Run AI
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 18px',
            backgroundColor: 'var(--success-50)',
            border: '1px solid var(--success-100)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--success-700)',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              <strong>{successMsg}</strong>
            </div>
            <Link to="/recommendations" className="btn btn-sm btn-primary">
              View Recommendations →
            </Link>
          </div>
        )}

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 18px',
            backgroundColor: 'var(--danger-50)',
            border: '1px solid var(--danger-100)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger-600)',
            marginBottom: '24px'
          }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '32px' }}>
          {/* LEFT COLUMN: Skills, Projects, Certifications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* 1. Skills Selector Card */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem' }}>Technical Skills</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select standard competencies or enter custom tags</p>
                  </div>
                </div>
                <span className="badge badge-primary">{selectedSkills.length} Selected</span>
              </div>

              {/* Selected Skills Chips with Proficiency */}
              <div style={{
                padding: '16px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '20px',
                minHeight: '80px'
              }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
                  Your Active Skills ({selectedSkills.length})
                </div>

                {selectedSkills.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    No skills selected yet. Click any skill tag below or type a custom skill.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {selectedSkills.map((sk) => (
                      <div
                        key={sk.name}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '4px 10px',
                          boxShadow: 'var(--shadow-xs)'
                        }}
                      >
                        <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {sk.name}
                        </span>
                        <select
                          value={sk.proficiency}
                          onChange={(e) => updateSkillProficiency(sk.name, e.target.value)}
                          style={{
                            fontSize: '0.75rem',
                            padding: '2px 4px',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '4px',
                            color: 'var(--primary-600)',
                            fontWeight: '600',
                            backgroundColor: 'var(--bg-secondary)'
                          }}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeSkill(sk.name)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            lineHeight: '1',
                            padding: '0 2px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Skill Input */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type custom skill (e.g. Next.js, Rust, Tableau, NLP)..."
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); } }}
                />
                <button type="button" onClick={addCustomSkill} className="btn btn-secondary" style={{ flexShrink: 0 }}>
                  <Plus size={16} /> Add Skill
                </button>
              </div>

              {/* Master Skills Categorized Catalog */}
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Quick Add from Master Library
                </div>

                {Object.keys(masterSkillsCatalog).length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Loading catalog...</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {Object.entries(masterSkillsCatalog).map(([category, skills]) => (
                      <div key={category}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>
                          {category}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {skills.map((skillName) => {
                            const isSelected = selectedSkills.some(s => s.name.toLowerCase() === skillName.toLowerCase());
                            return (
                              <button
                                key={skillName}
                                type="button"
                                onClick={() => toggleSkill(skillName)}
                                className={`skill-tag ${isSelected ? 'matched' : ''}`}
                                style={{ cursor: 'pointer', border: isSelected ? '1px solid var(--success-600)' : '1px solid var(--border-subtle)' }}
                              >
                                {isSelected ? '✓' : '+'} {skillName}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Projects Manager Card */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--purple-50)', color: 'var(--purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FolderGit2 size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem' }}>Academic & Personal Projects</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Used for TF-IDF Semantic Cosine Similarity analysis</p>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={() => setShowAddProject(!showAddProject)} 
                  className="btn btn-secondary btn-sm"
                >
                  <Plus size={15} /> {showAddProject ? 'Cancel' : 'Add Project'}
                </button>
              </div>

              {/* Add Project Form Drawer */}
              {showAddProject && (
                <div style={{
                  padding: '18px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '20px'
                }}>
                  <div className="form-group">
                    <label className="form-label">Project Title</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Real-Time Fraud Detection System"
                      value={newProject.project_name}
                      onChange={(e) => setNewProject({ ...newProject, project_name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Project Description</label>
                    <textarea
                      rows={3}
                      className="form-textarea"
                      placeholder="Explain problem statement, architecture, dataset, algorithms, and results..."
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Technologies & Frameworks Used</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Python, Scikit-learn, Flask, Docker"
                      value={newProject.technologies}
                      onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                    />
                  </div>

                  <button type="button" onClick={handleAddProject} className="btn btn-primary btn-sm">
                    Save This Project
                  </button>
                </div>
              )}

              {/* Projects List */}
              {projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No projects added yet. Adding projects improves TF-IDF cosine matching scores!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {projects.map((proj, idx) => (
                    <div
                      key={proj.id || idx}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                            {proj.project_name}
                          </h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '8px' }}>
                            {proj.description}
                          </p>
                          {proj.technologies && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {proj.technologies.split(',').map((t, tIdx) => (
                                <span key={tIdx} className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                                  {t.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteProject(idx)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--danger-600)',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title="Delete Project"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Certifications Manager Card */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--success-50)', color: 'var(--success-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem' }}>Certifications & Credentials</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Showcases external credentials to recruiters</p>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={() => setShowAddCert(!showAddCert)} 
                  className="btn btn-secondary btn-sm"
                >
                  <Plus size={15} /> {showAddCert ? 'Cancel' : 'Add Certification'}
                </button>
              </div>

              {/* Add Cert Form Drawer */}
              {showAddCert && (
                <div style={{
                  padding: '18px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '20px'
                }}>
                  <div className="form-group">
                    <label className="form-label">Certification Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. AWS Certified Cloud Practitioner"
                      value={newCert.certification_name}
                      onChange={(e) => setNewCert({ ...newCert, certification_name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Issuing Organization</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Amazon Web Services / Coursera"
                      value={newCert.organization}
                      onChange={(e) => setNewCert({ ...newCert, organization: e.target.value })}
                    />
                  </div>

                  <button type="button" onClick={handleAddCert} className="btn btn-primary btn-sm">
                    Save Certification
                  </button>
                </div>
              )}

              {/* Certifications List */}
              {certifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No certifications added yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {certifications.map((cert, idx) => (
                    <div
                      key={cert.id || idx}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {cert.certification_name}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {cert.organization || 'Verified Provider'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteCert(idx)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--danger-600)',
                          cursor: 'pointer'
                        }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Academics & Preferences */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* 1. Academic & Preferences Card */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem' }}>Academics & Preferences</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Parameters for CGPA & work mode scoring</p>
                </div>
              </div>

              {/* CGPA */}
              <div className="form-group">
                <label className="form-label" htmlFor="cgpa">Current CGPA (Out of 10.0)</label>
                <input
                  id="cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  className="form-input"
                  placeholder="e.g. 8.45"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Used to qualify against minimum CGPA cutoffs</span>
              </div>

              {/* Preferred Domain */}
              <div className="form-group">
                <label className="form-label" htmlFor="preferredDomain">Primary Target Domain</label>
                <select
                  id="preferredDomain"
                  className="form-select"
                  value={preferredDomain}
                  onChange={(e) => setPreferredDomain(e.target.value)}
                >
                  <option value="Data Science">Data Science & Analytics</option>
                  <option value="Artificial Intelligence">AI & Machine Learning</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Full Stack Development">Full Stack Engineering</option>
                  <option value="Cloud Computing">Cloud & DevOps</option>
                  <option value="Cyber Security">Cyber Security</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                </select>
              </div>

              {/* Opportunity Type */}
              <div className="form-group">
                <label className="form-label">Opportunity Type Preference</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {['Internship', 'Job', 'Both'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setOpportunityType(opt)}
                      className={`btn btn-sm ${opportunityType === opt ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.85rem' }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Mode */}
              <div className="form-group">
                <label className="form-label">Work Mode Preference</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {['Remote', 'Hybrid', 'On-site', 'Any'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setWorkMode(mode)}
                      className={`btn btn-sm ${workMode === mode ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.8rem', padding: '6px 4px' }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Location */}
              <div className="form-group">
                <label className="form-label" htmlFor="location">Preferred Location / City</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input
                    id="location"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bangalore, Chennai, Remote"
                    value={preferredLocation}
                    onChange={(e) => setPreferredLocation(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Interests Multi-Check Card */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', marginBottom: '6px' }}>Career Interests</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                Select topics you are passionate about (20% of algorithm score).
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {allInterests.map((interest) => {
                  const isChecked = selectedInterests.includes(interest);
                  return (
                    <label
                      key={interest}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isChecked ? 'var(--primary-50)' : 'var(--bg-secondary)',
                        border: `1px solid ${isChecked ? 'var(--primary-200)' : 'var(--border-subtle)'}`,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: isChecked ? '600' : '400',
                        color: isChecked ? 'var(--primary-700)' : 'var(--text-primary)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleInterest(interest)}
                        style={{ accentColor: 'var(--primary-600)' }}
                      />
                      <span>{interest}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;

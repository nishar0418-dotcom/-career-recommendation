import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Check, 
  BookOpen, 
  ExternalLink, 
  Trophy, 
  Plus
} from 'lucide-react';

const RoadmapCard = ({ 
  rec, 
  completedStepKeys = {}, 
  onToggleStep, 
  onAddSkillToProfile,
  isAddedToProfile = false,
  savingSkill = false
}) => {
  const [expandedStepId, setExpandedStepId] = useState(null);

  if (!rec) return null;

  const skillName = rec.skill;
  const anchorId = `roadmap-${skillName.toLowerCase().replace(/\s+/g, '-')}`;

  // Assemble full sequential steps: Core Topics + Capstone Project
  const topics = rec.topics || [];
  const steps = [
    ...topics.map((t, idx) => ({
      id: `${skillName.toLowerCase()}-topic-${idx}`,
      stepNumber: idx + 1,
      title: t,
      type: 'Core Concept & Practical Study',
      duration: `Phase ${idx + 1} • ~3-5 Hours`,
      description: `Understand core principles of ${t}. Build small test scripts or review documentation to master this requirement.`,
      searchQuery: `${skillName} ${t} tutorial guide`
    })),
    {
      id: `${skillName.toLowerCase()}-project`,
      stepNumber: topics.length + 1,
      title: rec.project || `Production ${skillName} Application`,
      type: 'Hands-on Capstone Portfolio Project',
      duration: `Phase ${topics.length + 1} • ~8-12 Hours`,
      description: 'Build, deploy, and push this capstone project to GitHub. Add a comprehensive README and architecture diagram to prove your competency to recruiters.',
      searchQuery: `${skillName} ${rec.project} project tutorial github`
    }
  ];

  const totalSteps = steps.length;
  const completedCount = steps.filter(s => !!completedStepKeys[s.id]).length;
  const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const isFullyCompleted = totalSteps > 0 && completedCount === totalSteps;

  return (
    <div id={anchorId} className="card" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
      {/* Top Accent Gradient Bar for visual flair */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: isFullyCompleted 
          ? 'linear-gradient(90deg, #10b981, #059669)' 
          : 'linear-gradient(90deg, var(--primary-500), var(--primary-700))'
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-danger">Missing Competency</span>
            <span className="badge badge-warning">{rec.importance || 'High'} Priority</span>
            {isFullyCompleted && (
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Trophy size={12} /> Roadmap Completed!
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '1.45rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Mastering {skillName}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Interactive step-by-step curriculum with hands-on practice modules.
          </p>
        </div>

        {/* Profile Action */}
        <div>
          {isAddedToProfile ? (
            <span className="badge badge-success" style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={15} /> Added to Your Profile
            </span>
          ) : (
            <button
              onClick={() => onAddSkillToProfile(skillName)}
              disabled={savingSkill}
              className={`btn btn-sm ${isFullyCompleted ? 'btn-primary' : 'btn-outline'}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title="Add this skill to your verified student skills"
            >
              {savingSkill ? 'Updating...' : (
                <>
                  <Plus size={14} /> Add {skillName} to Profile
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Why Learn Callout */}
      <div style={{
        marginBottom: '22px',
        backgroundColor: 'var(--bg-secondary)',
        padding: '14px 18px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.04em' }}>
          Why Learn This Skill?
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
          {rec.why_learn}
        </p>
      </div>

      {/* Dynamic Progress Indicator */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Roadmap Progress:
            </span>
            <span style={{ fontSize: '0.85rem', color: isFullyCompleted ? 'var(--success-700)' : 'var(--primary-600)', fontWeight: '700' }}>
              {completedCount} of {totalSteps} Steps Completed ({progressPct}%)
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Click any step to mark as completed
          </span>
        </div>

        {/* Progress Bar Track */}
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '999px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressPct}%`,
            height: '100%',
            backgroundColor: isFullyCompleted ? '#10b981' : 'var(--primary-600)',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '999px'
          }} />
        </div>
      </div>

      {/* Completion Celebration Banner when 100% done */}
      {isFullyCompleted && (
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Trophy size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '800', color: '#065f46', fontSize: '1rem' }}>
                Outstanding! You have completed all steps for {skillName}!
              </div>
              <div style={{ color: '#047857', fontSize: '0.85rem' }}>
                You have mastered the core concepts and portfolio project. Add it to your profile to boost your job match percentage.
              </div>
            </div>
          </div>

          {!isAddedToProfile && (
            <button
              onClick={() => onAddSkillToProfile(skillName)}
              disabled={savingSkill}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Check size={14} /> Add to Profile Skills
            </button>
          )}
        </div>
      )}

      {/* Step-by-Step Interactive Timeline */}
      <div style={{ position: 'relative' }}>
        <div style={{
          fontSize: '0.92rem',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <BookOpen size={17} color="var(--primary-600)" />
          Step-by-Step Learning Timeline
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {steps.map((step, index) => {
            const isCompleted = !!completedStepKeys[step.id];
            const isProjectStep = index === steps.length - 1;

            return (
              <div
                key={step.id}
                onClick={() => onToggleStep(step.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '16px 18px',
                  backgroundColor: isCompleted ? '#f0fdf4' : '#ffffff',
                  border: isCompleted ? '1.5px solid #86efac' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isCompleted ? '0 1px 3px rgba(16, 185, 129, 0.1)' : 'var(--shadow-xs)'
                }}
                onMouseEnter={(e) => {
                  if (!isCompleted) {
                    e.currentTarget.style.borderColor = 'var(--primary-400)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCompleted) {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }
                }}
              >
                {/* Step Circle with Step Number or Completed Checkmark */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isCompleted ? '#10b981' : isProjectStep ? '#ecfdf5' : 'var(--primary-50)',
                  color: isCompleted ? '#ffffff' : isProjectStep ? '#059669' : 'var(--primary-600)',
                  border: isCompleted ? '2px solid #10b981' : isProjectStep ? '2px solid #10b981' : '2px solid var(--primary-200)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  marginTop: '2px',
                  transition: 'all 0.2s ease'
                }}>
                  {isCompleted ? <Check size={18} strokeWidth={3} /> : step.stepNumber}
                </div>

                {/* Step Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.74rem',
                        fontWeight: '700',
                        color: isCompleted ? '#059669' : 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        Step {step.stepNumber} • {step.type}
                      </span>
                      {isProjectStep && (
                        <span className="badge badge-success" style={{ fontSize: '0.72rem', padding: '1px 6px' }}>
                          Capstone Project
                        </span>
                      )}
                    </div>

                    {/* Step Status Badge */}
                    <div>
                      {isCompleted ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          color: '#047857',
                          backgroundColor: '#d1fae5',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          border: '1px solid #a7f3d0'
                        }}>
                          <CheckCircle2 size={13} /> Completed
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          color: 'var(--text-muted)',
                          backgroundColor: 'var(--bg-secondary)',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          border: '1px solid var(--border-subtle)'
                        }}>
                          <Circle size={12} /> Click to Complete
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Step Title */}
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: isCompleted ? '#065f46' : 'var(--text-primary)',
                    textDecoration: isCompleted ? 'none' : 'none',
                    marginBottom: '4px',
                    lineHeight: '1.4'
                  }}>
                    {step.title}
                  </div>

                  {/* Step Description */}
                  <p style={{
                    color: isCompleted ? '#047857' : 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    margin: '0 0 10px 0'
                  }}>
                    {step.description}
                  </p>

                  {/* Helper Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onToggleStep(step.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: isCompleted ? '#059669' : 'var(--primary-600)',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 size={14} /> Mark as Incomplete
                        </>
                      ) : (
                        <>
                          <Circle size={14} /> Mark as Completed
                        </>
                      )}
                    </button>

                    <span style={{ color: 'var(--border-subtle)' }}>•</span>

                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(step.searchQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-600)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                      title="Search free learning tutorials for this step"
                    >
                      Search Tutorials <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoadmapCard;

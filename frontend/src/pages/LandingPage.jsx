import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  Target, 
  BookOpen, 
  TrendingUp, 
  BrainCircuit, 
  Briefcase, 
  Award,
  BarChart2,
  Check,
  ChevronRight
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div>
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-pill animate-pulse-glow">
            <Sparkles size={16} /> Powered by TF-IDF & Multi-Factor Machine Learning
          </div>

          <h1 className="hero-title">
            Find the Right Career.<br />
            <span className="gradient-text">Build the Right Skills.</span><br />
            Get the Right Opportunity.
          </h1>

          <p className="hero-subtitle">
            Match your skills with real job requirements, identify missing skills, and discover top internships.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started <ArrowRight size={18} />
            </Link>
            <Link to="/opportunities" className="btn btn-secondary btn-lg">
              <Search size={18} /> Browse Opportunities
            </Link>
          </div>

          {/* Key Metrics Strip */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '24px',
            padding: '10px 24px',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="var(--success-600)" />
              <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>AI Match Score %</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="var(--success-600)" />
              <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>Skill Gap Analysis</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="var(--success-600)" />
              <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>Learning Roadmaps</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Four-Stage Architecture Workflow Infographic */}
      <section style={{ padding: '48px 0', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span className="badge badge-primary" style={{ marginBottom: '8px' }}>Simple 4-Step Process</span>
            <h2 style={{ fontSize: '1.9rem', marginBottom: '8px' }}>How It Works</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto', fontSize: '0.95rem' }}>
              From student profile to matched internship in 4 simple steps.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            position: 'relative'
          }}>
            {/* Stage 1 */}
            <div className="card" style={{ textAlign: 'center', padding: '24px 16px', borderTop: '4px solid var(--primary-600)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto'
              }}>
                <Target size={24} />
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--primary-600)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Step 01
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Student Profile</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: '1.4' }}>
                Add your technical skills, projects, and career preferences.
              </p>
            </div>

            {/* Stage 2 */}
            <div className="card" style={{ textAlign: 'center', padding: '24px 16px', borderTop: '4px solid #8b5cf6' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: 'var(--purple-50)',
                color: 'var(--purple-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto'
              }}>
                <BrainCircuit size={24} />
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--purple-600)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Step 02
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>AI Match Engine</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: '1.4' }}>
                Calculates your match % for each job vacancy.
              </p>
            </div>

            {/* Stage 3 */}
            <div className="card" style={{ textAlign: 'center', padding: '24px 16px', borderTop: '4px solid #f59e0b' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: 'var(--warning-50)',
                color: 'var(--warning-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto'
              }}>
                <BookOpen size={24} />
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--warning-600)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Step 03
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Skill Gap Matrix</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: '1.4' }}>
                Highlights missing skills and provides learning roadmaps.
              </p>
            </div>

            {/* Stage 4 */}
            <div className="card" style={{ textAlign: 'center', padding: '24px 16px', borderTop: '4px solid var(--success-600)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: 'var(--success-50)',
                color: 'var(--success-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto'
              }}>
                <Briefcase size={24} />
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--success-600)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Step 04
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Apply to Jobs</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: '1.4' }}>
                Explore ranked opportunities with direct application links.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Problem vs. The AI Solution */}
      <section style={{ padding: '80px 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '12px' }}>Bridging the Campus-to-Career Disconnect</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto' }}>
              Why traditional keyword search fails students, and how intelligent multi-factor matching delivers results.
            </p>
          </div>

          <div className="grid-2">
            {/* Problem Box */}
            <div className="card" style={{ backgroundColor: 'var(--danger-50)', borderColor: 'var(--danger-100)', padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span className="badge badge-danger">The Challenge</span>
                <h3 style={{ color: 'var(--danger-600)', fontSize: '1.3rem' }}>Traditional Job Portals</h3>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', color: '#881337', fontSize: '0.94rem' }}>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <strong>✗</strong> Blind keyword searches ignore project portfolio depth and student potential.
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <strong>✗</strong> Students do not know why they get rejected or which skills disqualified them.
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <strong>✗</strong> No actionable guidance on what specific technologies to learn next.
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <strong>✗</strong> Generic job boards overload students with irrelevant senior-level listings.
                </li>
              </ul>
            </div>

            {/* Solution Box */}
            <div className="card" style={{ backgroundColor: 'var(--success-50)', borderColor: 'var(--success-100)', padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span className="badge badge-success">The CareerMatch AI Solution</span>
                <h3 style={{ color: 'var(--success-700)', fontSize: '1.3rem' }}>Intelligent Matching</h3>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', color: '#064e3b', fontSize: '0.94rem' }}>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <Check size={18} color="var(--success-600)" style={{ flexShrink: 0 }} />
                  <strong>5-Factor Algorithm:</strong> Computes weighted match considering skills, interests, CGPA, projects & work mode.
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <Check size={18} color="var(--success-600)" style={{ flexShrink: 0 }} />
                  <strong>Instant Skill Gap Matrix:</strong> Clearly highlights what skills you have (✓) vs what skills you are missing (✗).
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <Check size={18} color="var(--success-600)" style={{ flexShrink: 0 }} />
                  <strong>Curated Learning Roadmaps:</strong> Exact topics and resume-worthy projects recommended for every missing skill.
                </li>
                <li style={{ display: 'flex', gap: '10px' }}>
                  <Check size={18} color="var(--success-600)" style={{ flexShrink: 0 }} />
                  <strong>Domain Fit Radar:</strong> Evaluates suitability across Data Science, Web Dev, Cloud, AI/ML & Cyber Security.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Grid */}
      <section id="features" style={{ padding: '70px 0', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge badge-primary" style={{ marginBottom: '10px' }}>System Capabilities</span>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '12px' }}>Designed for Student Placement Success</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
              Everything students need to benchmark their readiness, acquire in-demand skills, and land internships.
            </p>
          </div>

          <div className="grid-3">
            <div className="card">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <TrendingUp size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Explainable Match Scoring</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                See exact mathematical breakdown showing how your technical skills (50%), domain interests (20%), projects (10%), and academics (10%) contribute to each match.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--purple-50)', color: 'var(--purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <BrainCircuit size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>TF-IDF Project Analysis</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Scikit-Learn TF-IDF vectorizer extracts conceptual tokens from your project descriptions and computes Cosine Similarity with employer job specifications.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--warning-50)', color: 'var(--warning-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <BookOpen size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Skill Gap Matrix</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Identifies missing high-demand skills across target companies. Provides actionable learning roadmaps with syllabus topics and recommended portfolio projects.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--success-50)', color: 'var(--success-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <BarChart2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Domain Fit Radar</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Visualizes your alignment across 7 major technology domains: Data Science, AI/ML, Web Development, Cloud Computing, Cyber Security, and Mobile Apps.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Award size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Career Archetype Matching</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Evaluates which specific roles (Data Analyst, Full Stack Developer, ML Engineer, Cyber Security Analyst) best match your natural competencies and preferences.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--purple-50)', color: 'var(--purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Search size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Smart Opportunity Filters</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Filter opportunities by keyword, tech domain, work mode (Remote/Hybrid/On-site), internship vs full-time job, and minimum match percentage threshold.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Call To Action Banner */}
      <section style={{ padding: '80px 0', backgroundColor: '#ffffff', textAlign: 'center' }}>
        <div className="container">
          <div style={{
            maxWidth: '820px',
            margin: '0 auto',
            padding: '56px 40px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
              Ready to Accelerate Your Career Journey?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px auto' }}>
              Create your student profile in under 2 minutes, run the AI analyzer, and explore your custom opportunity matches.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Free Account <ChevronRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Demo Student Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

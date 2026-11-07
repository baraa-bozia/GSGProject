
import React, { useState, useEffect } from 'react';
import AuthPage from './AuthPage';
import { ChartNoAxesColumnIncreasing } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import {
  LayoutDashboard, FileText, BriefcaseBusiness, History, Settings,
  BookOpen, Plus, ArrowUpRight, ArrowRight, Menu, X, ChevronRight,
  CircleCheck, LockKeyhole, Sparkles, Search, Pencil, Trash2, Building2, XCircle
} from 'lucide-react';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'
).replace(/\/$/, '');

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Resumes', icon: FileText },
  { label: 'Job descriptions', icon: BriefcaseBusiness },
  { label: 'Interview history', icon: History },
  { label: 'Profile & settings', icon: Settings },
];

const interviews = [
  { date: '20 Oct 2026', role: 'Backend Engineer', company: 'Northstar Labs', attempt: '2', status: 'In progress', score: 'Pending', action: 'Open interview', kind: 'progress' },
  { date: '20 Oct 2026', role: 'Frontend Engineer', company: 'Harbor Studio', attempt: '1', status: 'Created', score: 'Unavailable', action: 'Set up', kind: 'created' },
  { date: '18 Oct 2026', role: 'Backend Engineer', company: 'Northstar Labs', attempt: '1', status: 'Completed', score: '76 / 100', action: 'View report', kind: 'completed' },
];

function App() {
  const [currentUser, setCurrentUser] = useState(() => { try { return JSON.parse(sessionStorage.getItem('sparr_user') || 'null'); } catch { return null; } });
  const [active, setActive] = useState('Dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [resumesLoading, setResumesLoading] = useState(false);
  const [resumesError, setResumesError] = useState('');
  const [uploadBusy, setUploadBusy] = useState(false);
   const [resumeDetails, setResumeDetails] = useState(null);
const [resumeDetailsLoading, setResumeDetailsLoading] = useState(false);
const [resumeDetailsError, setResumeDetailsError] = useState('');

const [gapAnalysis, setGapAnalysis] = useState(null);
const [gapAnalysisLoading, setGapAnalysisLoading] = useState(false);
const [gapAnalysisError, setGapAnalysisError] = useState('');

  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [jobDetailsLoading, setJobDetailsLoading] = useState(false);
  const [jobSearch, setJobSearch] = useState('');
  const [jobFormOpen, setJobFormOpen] = useState(false);
  const [jobSaveBusy, setJobSaveBusy] = useState(false);
  const [jobForm, setJobForm] = useState({ title: '', company: '', description: '' });

  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('sparr_token');
    if (!token) throw new Error('Your session has expired. Please sign in again.');
    return { Accept: 'application/json', Authorization: `Bearer ${token}` };
  };

  const fetchResumes = async () => {
    setResumesLoading(true);
    setResumesError('');
    try {
      const response = await fetch(`${API_BASE_URL}/resumes?page=1`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || `Failed to load resumes (${response.status}).`);
      }
      const records = Array.isArray(data.data) ? data.data : [];
      setResumes(records);
      setSelectedResume(current =>
        records.some(resume => resume.id === current) ? current : (records[0]?.id ?? null)
      );
    } catch (err) {
      setResumesError(err instanceof TypeError
        ? `Could not connect to the backend at ${API_BASE_URL}.`
        : (err.message || 'Could not load resumes.'));
    } finally {
      setResumesLoading(false);
    }
  };


  const fetchResumeDetails = async (resumeId) => {
  if (!resumeId) return;

  setResumeDetailsLoading(true);
  setResumeDetailsError('');
  setResumeDetails(null);


  try {
    const response = await fetch(
      `${API_BASE_URL}/resumes/${resumeId}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || `Failed to load resume details (${response.status}).`
      );
    }

    // setResumeDetails(data.data || null);
    setResumeDetails(data.data ?? data);
  } catch (err) {
    setResumeDetailsError(
      err instanceof TypeError
        ? `Could not connect to the backend at ${API_BASE_URL}.`
        : err.message || 'Could not load resume details.'
    );
  } finally {
    setResumeDetailsLoading(false);
  }
};

const fetchGapAnalysis = async (jobId, resumeId) => {
  if (!jobId || !resumeId) {
    setGapAnalysisError('Please select a job description and a resume.');
    return;
  }

  setGapAnalysisLoading(true);
  setGapAnalysisError('');
  setGapAnalysis(null);

  try {
    const response = await fetch(
      `${API_BASE_URL}/job-descriptions/${jobId}/gap-analysis/${resumeId}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || `Failed to load skill gap analysis (${response.status}).`
      );
    }

    setGapAnalysis(data.data?.analysis || null);
  } catch (err) {
    setGapAnalysisError(
      err instanceof TypeError
        ? `Could not connect to the backend at ${API_BASE_URL}.`
        : err.message || 'Could not load skill gap analysis.'
    );
  } finally {
    setGapAnalysisLoading(false);
  }
};

  useEffect(() => {
    if (currentUser) fetchResumes();
  }, [currentUser]);

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!/\.(pdf|txt)$/i.test(file.name)) {
      announce('Unsupported file type. Please choose a PDF or TXT file.');
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      announce('This file exceeds the 5 MB limit. Choose a smaller file.');
      event.target.value = '';
      return;
    }

    setUploadBusy(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/resumes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const validationErrors = data.errors
          ? Object.values(data.errors).flat().join(' ')
          : '';
        throw new Error(validationErrors || data.message || `Upload failed (${response.status}).`);
      }

      const uploadedResume = data.data;
      if (uploadedResume?.id) setSelectedResume(uploadedResume.id);
      announce(data.message || 'Resume uploaded successfully.');
      await fetchResumes();
      if (uploadedResume?.id) setSelectedResume(uploadedResume.id);
    } catch (err) {
      announce(err instanceof TypeError
        ? `Could not connect to the backend at ${API_BASE_URL}.`
        : (err.message || 'Resume upload failed.'));
    } finally {
      setUploadBusy(false);
      event.target.value = '';
    }
  };

  const formatResumeDate = (date) => {
    if (!date) return 'Date unavailable';
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString();
  };

  const resumeStatusLabel = (status) => ({
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
  }[status] || 'Unknown');

 

  const fetchJobDescriptions = async () => {
    setJobsLoading(true);
    setJobsError('');
    try {
      const response = await fetch(`${API_BASE_URL}/job-descriptions?page=1&per_page=15`, {
        method: 'GET', headers: getAuthHeaders(),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || `Failed to load job descriptions (${response.status}).`);
      const records = Array.isArray(data.data) ? data.data : [];
      setJobDescriptions(records);
      setSelectedJobId(current => records.some(job => job.id === current) ? current : (records[0]?.id ?? null));
    } catch (err) {
      setJobsError(err instanceof TypeError ? `Could not connect to the backend at ${API_BASE_URL}.` : (err.message || 'Could not load job descriptions.'));
    } finally { setJobsLoading(false); }
  };

  const fetchJobDetails = async (jobId, quiet = false) => {
    if (!jobId) return;
    if (!quiet) setJobDetailsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/job-descriptions/${jobId}`, {
        method: 'GET', headers: getAuthHeaders(),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || `Failed to load job details (${response.status}).`);
      setSelectedJobDetails(data.data || null);
    } catch (err) {
      if (!quiet) announce(err instanceof TypeError ? `Could not connect to the backend at ${API_BASE_URL}.` : (err.message || 'Could not load job details.'));
    } finally { if (!quiet) setJobDetailsLoading(false); }
  };
  //   useEffect(() => {
  //   if (currentUser && active === 'Job descriptions') fetchJobDescriptions();
  // }, [currentUser, active]);
  useEffect(() => {
  if (currentUser && (active === 'Job descriptions' || active === 'Dashboard')) {
    fetchJobDescriptions();
  }
}, [currentUser, active]);

  useEffect(() => {
    if (!selectedJobId || active !== 'Job descriptions') { setSelectedJobDetails(null); return; }
    fetchJobDetails(selectedJobId);
  }, [selectedJobId, active]);

  useEffect(() => {
    const status = selectedJobDetails?.parsing_status;
    if (!selectedJobId || active !== 'Job descriptions' || !['pending', 'processing'].includes(status)) return;
    const timer = window.setInterval(() => fetchJobDetails(selectedJobId, true), 4000);
    return () => window.clearInterval(timer);
  }, [selectedJobId, selectedJobDetails?.parsing_status, active]);

  const resetJobForm = () => {
    setJobForm({ title: '', company: '', description: '' });
    setJobFormOpen(false);
  };

  const saveJob = async (event) => {
    event.preventDefault();
    const title = jobForm.title.trim();
    const company_name = jobForm.company.trim();
    const description = jobForm.description.trim();
    if (!title || !company_name || !description) {
      announce('Please fill in the job title, company name, and description.');
      return;
    }
    setJobSaveBusy(true);
    try {
      const response = await fetch(`${API_BASE_URL}/job-descriptions`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, company_name, description }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const validationErrors = data.errors ? Object.values(data.errors).flat().join(' ') : '';
        throw new Error(validationErrors || data.message || `Could not save job description (${response.status}).`);
      }
      const created = data.data;
      announce(data.message || 'Job description saved successfully.');
      resetJobForm();
      await fetchJobDescriptions();
      if (created?.id) setSelectedJobId(created.id);
    } catch (err) {
      announce(err instanceof TypeError ? `Could not connect to the backend at ${API_BASE_URL}.` : (err.message || 'Could not save job description.'));
    } finally { setJobSaveBusy(false); }
  };

  const announce = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3200);
    setMenuOpen(false);
  };

  // if (!currentUser) return <AuthPage onAuthenticated={(user) => { setCurrentUser(user); setActive('Dashboard'); }} />;

if (!currentUser) {
  return (
    <>
      <Toaster position="top-right" />
      <AuthPage
        onAuthenticated={(user) => {
          setCurrentUser(user);
          setActive('Dashboard');
        }}
      />
    </>
  );
}

  const displayName = currentUser?.name || currentUser?.email?.split('@')[0] || 'User';
  const initials = displayName.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();


  const hasResume = resumes.length > 0;
const hasJobDescription = jobDescriptions.length > 0;

const resumeCompleted = resumes.some(
  resume => resume.parsing_status === 'completed'
);

const jobCompleted = jobDescriptions.some(
  job => job.parsing_status === 'completed'
);

const hasPendingAnalysis = [...resumes, ...jobDescriptions].some(
  item => ['pending', 'processing'].includes(item.parsing_status)
);

let nextStepTitle = 'Upload your resume';
let nextStepDescription = 'Start by adding your resume to your workspace.';
let nextStepButton = 'Upload resume';
let nextStepAction = 'Resumes';

if (hasResume && !hasJobDescription) {
  nextStepTitle = 'Add a job description';
  nextStepDescription = 'Choose a target role to continue your preparation.';
  nextStepButton = 'Add job description';
  nextStepAction = 'Job descriptions';
} else if (hasResume && hasJobDescription && hasPendingAnalysis) {
  nextStepTitle = 'Your skills are being analyzed';
  nextStepDescription = 'Your resume and job description are being processed.';
  nextStepButton = 'View progress';
  nextStepAction = 'Job descriptions';
} else if (hasResume && hasJobDescription && resumeCompleted && jobCompleted) {
  nextStepTitle = 'Your documents are ready';
  nextStepDescription = 'Your resume and job description have been analyzed.';
  nextStepButton = 'View job description';
  nextStepAction = 'Job descriptions';
}
  return (
    <div className="app-shell">
      <Toaster position="top-right" />
      <header className="topbar">
        <button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <button className="brand" onClick={() => setActive('Dashboard')} aria-label="Sparr home">
          <span className="brand-name">sparr<span className="brand-dot">.</span></span>
          <span className="brand-subtitle">TECHNICAL INTERVIEW PRACTICE</span>
        </button>
        <div className="topbar-right">
          <span className="privacy-label"><LockKeyhole size={14} /> Private workspace</span>
          <span className="top-divider">/</span>
          <button className="profile-chip" onClick={() => setActive('Profile & settings')}>
            <span className="avatar">{initials}</span><span>{displayName}</span><ChevronRight size={15} />
          </button>
          <button className="logout-button" onClick={() => { sessionStorage.removeItem('sparr_token'); sessionStorage.removeItem('sparr_user'); setCurrentUser(null); setActive('Dashboard'); }} title="Sign out">Sign out</button>
        </div>
      </header>

      <div className="layout">
        <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
          <div className="nav-label">WORKSPACE</div>
          <nav>
            {navItems.map(({ label, icon: Icon }) => (
              <button key={label} className={`nav-item ${active === label ? 'active' : ''}`}
                onClick={() => { setActive(label); setMenuOpen(false); }}>
                <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
                {active === label && <span className="active-indicator" />}
              </button>
            ))}
          </nav>
          <div className="sidebar-note">
            <div className="privacy-icon"><LockKeyhole size={16} /></div>
            <p>Your documents, interviews and reports are private to your account.</p>
          </div>
          <button className="guide-link" onClick={() => announce('Preparation guide will be added in a future step.')}>
            <BookOpen size={16} /> Preparation guide <ArrowUpRight size={14} />
          </button>
          <div className="sidebar-bottom"><Sparkles size={16} /><span>Practice with purpose.</span></div>
        </aside>

        <main className="main-content">
          {active === 'Dashboard' ? <>
          <div className="page-heading">
            <div>
              <div className="eyebrow">YOUR PRIVATE WORKSPACE <span className="eyebrow-line" /></div>
              <h1>Welcome back, <span>{displayName.split(/\s+/)[0]}</span></h1>
              <p className="subtitle">  Build confidence for your next technical interview.</p>
            </div>
            <button className="primary-button" onClick={() => setActive('New interview')}>
              <Plus size={18} /> New interview
            </button>
          </div>

          {/* <div className="overview-row">
            <span>Your preparation overview</span>
            <span className="date-label">Tuesday, 20 October 2026</span>
          </div> */}
          <div className="overview-row">
  <span>Your preparation overview</span>
  <span className="date-label">
    {new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}
  </span>
</div>

          {/* <section className="next-step card">
            <div className="next-step-top">
              <div>
                <div className="section-kicker"><span className="live-dot" /> YOUR NEXT STEP</div>
                <h2>Keep your momentum going</h2>
                <p className="muted">Backend Engineer <span className="bullet">•</span> Northstar Labs <span className="bullet">•</span> Attempt 2</p>
              </div>
              <span className="status-pill in-progress">In progress</span>
            </div>
            <div className="progress-meta"><span>Main question <strong>3 of 8</strong></span><span>38% complete</span></div>
            <div className="progress-track" aria-label="3 of 8 main questions completed"><span /></div>
            <div className="next-step-bottom">
              <div className="saved-info"><CircleCheck size={16} /> 3 main answers saved <span>·</span> Resume v2 <span>·</span> Job description v3</div>
              <button className="dark-button" onClick={() => announce('Interview view will be connected in the next step.')}>Open interview <ArrowRight size={16} /></button>
            </div>
          </section> */}
          <section className="next-step card">
  <div className="next-step-top">
    <div>
      <div className="section-kicker">
        <span className="live-dot" /> YOUR NEXT STEP
      </div>
      <h2>{nextStepTitle}</h2>
      <p className="muted">{nextStepDescription}</p>
    </div>

    <span className="status-pill in-progress">
      {hasResume && hasJobDescription ? 'In progress' : 'Not started'}
    </span>
  </div>

  <div className="next-step-bottom">
    <div className="saved-info">
      <CircleCheck size={16} />
      {resumes.length} resume(s)
      <span>·</span>
      {jobDescriptions.length} job description(s)
    </div>

    <button
      className="dark-button"
      onClick={() => setActive(nextStepAction)}
    >
      {nextStepButton} <ArrowRight size={16} />
    </button>
  </div>
</section>

          {/* <section className="journey-grid" aria-label="Preparation steps">
            {[
              { number: '01', title: 'Resume', description: 'Maya_Chen_Backend_v2.pdf', state: 'Ready' },
              { number: '02', title: 'Target job', description: 'Backend Engineer saved', state: 'Ready' },
              { number: '03', title: 'Skill gaps', description: 'Analysis completed', state: 'Ready' },
              { number: '04', title: 'Interview', description: 'Main question 3 of 8', state: 'In progress' },
            ].map((item) => (
              <div className={`journey-card ${item.number === '04' ? 'journey-current' : ''}`} key={item.number}>
                <div className="journey-top"><span className="journey-number">{item.number}</span>{item.number !== '04' && <CircleCheck size={16} className="check-icon" />}</div>
                <h3>{item.title}</h3><p>{item.description}</p>
                <span className={`journey-state ${item.number === '04' ? 'current' : ''}`}>{item.state}</span>
              </div>
            ))}
          </section> */}
          <section className="journey-grid" aria-label="Preparation steps">
  {[
    {
      number: '01',
      title: 'Resume',
      description: resumes.length
        ? (resumes[0].title || resumes[0].file_name || 'Resume uploaded')
        : 'No resume uploaded yet',
      state: resumes.length
        ? resumes[0].parsing_status === 'completed'
          ? 'Ready'
          : resumes[0].parsing_status === 'failed'
            ? 'Needs attention'
            : 'Processing'
        : 'Not started',
    },
    {
      number: '02',
      title: 'Target job',
      description: jobDescriptions.length
        ? `${jobDescriptions[0].title || 'Job description'}${jobDescriptions[0].company_name ? ` · ${jobDescriptions[0].company_name}` : ''}`
        : 'No job description added yet',
      state: jobDescriptions.length
        ? jobDescriptions[0].parsing_status === 'completed'
          ? 'Ready'
          : jobDescriptions[0].parsing_status === 'failed'
            ? 'Needs attention'
            : 'Processing'
        : 'Not started',
    },
    {
      number: '03',
      title: 'Skill gaps',
      description: 'Based on your resume and target job',
      state:
        resumes.some(r => r.parsing_status === 'completed') &&
        jobDescriptions.some(j => j.parsing_status === 'completed')
          ? 'Ready'
          : 'Waiting',
    },
    {
      number: '04',
      title: 'Interview',
      description: 'Your interview preparation starts here',
      state: 'Not started',
    },
  ].map((item) => (
    <div className="journey-card" key={item.number}>
      <div className="journey-top">
        <span className="journey-number">{item.number}</span>
        {item.state === 'Ready' && (
          <CircleCheck size={16} className="check-icon" />
        )}
      </div>

      <h3>{item.title}</h3>
      <p>{item.description}</p>

      <span className={`journey-state ${item.state === 'Ready' ? 'current' : ''}`}>
        {item.state}
      </span>
    </div>
  ))}
</section>

          {/* <section className="stats-grid">
            <div className="stat-card card">
              <div className="stat-top"><span>Completed interviews</span><span className="stat-icon"><History size={17} /></span></div>
              <div className="stat-value">1<span className="stat-small"> / 4 sessions</span></div>
              <p className="stat-foot">One completed attempt so far</p>
            </div>
            <div className="stat-card card">
              <div className="stat-top"><span>Latest estimated score</span><span className="stat-icon"><Sparkles size={17} /></span></div>
              <div className="stat-value">76<span className="stat-denom">/100</span></div>
              <p className="stat-foot"><span className="tiny-dot" /> Backend Engineer <span>·</span> 18 Oct 2026</p>
            </div>
            <div className="stat-card focus-card card">
              <div className="stat-top"><span>Current focus</span><span className="stat-icon focus-icon"><ArrowUpRight size={17} /></span></div>
              <div className="focus-title">Caching</div>
              <p className="stat-foot">Practice invalidation and failure modes</p>
            </div>
          </section> */}
          <section className="stats-grid">
  <div className="stat-card card">
    <div className="stat-top">
      <span>Completed interviews</span>
      <span className="stat-icon"><History size={17} /></span>
    </div>
    <div className="stat-value">0<span className="stat-small"> sessions</span></div>
    <p className="stat-foot">No completed interviews yet</p>
  </div>

  <div className="stat-card card">
    <div className="stat-top">
      <span>Latest estimated score</span>
      <span className="stat-icon"><Sparkles size={17} /></span>
    </div>
    <div className="stat-value">—<span className="stat-denom">/100</span></div>
    <p className="stat-foot">No interview reports available yet</p>
  </div>

  <div className="stat-card focus-card card">
    <div className="stat-top">
      <span>Current focus</span>
      <span className="stat-icon focus-icon"><ArrowUpRight size={17} /></span>
    </div>
    <div className="focus-title">Skill matching</div>
    <p className="stat-foot">Identify the skills required for your target job</p>
  </div>
</section>


                    {/* <section className="insights-grid">
            <div className="card performance-card">
              <div className="card-heading">
                <div><div className="section-kicker">PERFORMANCE</div><h2>Latest completed performance</h2></div>
                <span className="soft-tag">Attempt 1</span>
              </div>
              <p className="muted chart-description">Estimated score by main question</p>
              <div className="chart" role="img" aria-label="Scores: Q1 80, Q2 75, Q3 85, Q4 70, Q5 75, Q6 65, Q7 80, Q8 78">
                {[80,75,85,70,75,65,80,78].map((score, i) => (
                  <div className="bar-column" key={i}>
                    <span className="bar-score">{score}</span>
                    <div className={`bar ${i === 5 ? 'bar-low' : ''}`} style={{ height: `${score * 0.78}px` }} />
                    <span className="bar-label">Q{i + 1}</span>
                  </div>
                ))}
              </div>
              <div className="chart-footer"><span className="chart-legend" /> One completed attempt <span className="muted">· More data needed for a trend</span></div>
            </div>

            <div className="card coaching-card">
              <div className="coaching-header"><div className="coaching-icon"><Sparkles size={18} /></div><div><div className="section-kicker">PERSONALIZED INSIGHT</div><h2>Make your next answer stronger</h2></div></div>
              <p className="muted">Based on your completed report from 18 Oct.</p>
              <div className="insight-block strength"><span className="insight-label">YOUR STRENGTH</span><p>Clear explanations of API design.</p></div>
              <div className="insight-block improvement"><span className="insight-label">ROOM TO IMPROVE</span><p>Caching trade-offs and idempotency.</p></div>
              <div className="tip-box"><span className="tip-mark">↗</span><p>State assumptions, compare options, then explain a failure case.</p></div>
              <button className="outline-button" onClick={() => announce('Completed report will be connected in the next step.')}>View completed report <ArrowRight size={15} /></button>
            </div>
          </section> */}
          <section className="insights-grid">
  <div className="card performance-card">
    <div className="card-heading">
      <div>
        <div className="section-kicker">PERFORMANCE</div>
        <h2>Latest completed performance</h2>
      </div>
      <span className="soft-tag">No reports yet</span>
    </div>

    <div className="empty-performance">
      <div className="empty-chart-icon">
        <ChartNoAxesColumnIncreasing size={28} />
      </div>
      <h3>No completed interviews yet</h3>
      <p className="muted">
        Your performance breakdown will appear here after you complete
        your first interview.
      </p>
    </div>

    <div className="chart-footer">
      <span className="muted">Your interview scores will be tracked here.</span>
    </div>
  </div>

  <div className="card coaching-card">
    <div className="coaching-header">
      <div className="coaching-icon">
        <Sparkles size={18} />
      </div>
      <div>
        <div className="section-kicker">PERSONALIZED INSIGHT</div>
        <h2>Your personal feedback</h2>
      </div>
    </div>

    <p className="muted">
      Personalized recommendations based on your interview performance.
    </p>

    <div className="empty-insight">
      <Sparkles size={22} />
      <h3>Insights are coming soon</h3>
      <p className="muted">
        Complete an interview to receive feedback on your strengths
        and areas for improvement.
      </p>
    </div>

    <button
      className="outline-button"
      onClick={() => setActive('New interview')}
    >
      Start an interview <ArrowRight size={15} />
    </button>
  </div>
</section>

          {/* <section className="card interviews-card">
            <div className="table-heading">
              <div><div className="section-kicker">YOUR PRACTICE</div><h2>Recent interviews</h2></div>
              <button className="text-button" onClick={() => setActive('Interview history')}>View all history <ArrowRight size={15} /></button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Target role</th><th>Attempt</th><th>Status</th><th>Score</th><th></th></tr></thead>
                <tbody>
                  {interviews.map(item => (
                    <tr key={`${item.date}-${item.role}-${item.attempt}`}>
                      <td><span className="date-cell">{item.date}</span></td>
                      <td><div className="role-cell">{item.role}</div><div className="company-cell">{item.company}</div></td>
                      <td><span className="attempt-badge">{item.attempt}</span></td>
                      <td><span className={`table-status ${item.kind}`}><span />{item.status}</span></td>
                      <td><span className={item.kind === 'completed' ? 'score-value' : 'score-pending'}>{item.score}</span></td>
                      <td><button className="row-action" onClick={() => announce(`${item.action} will be connected in the next step.`)}>{item.action}<ArrowUpRight size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mobile-interviews">
              {interviews.map(item => (
                <button className="mobile-interview-row" key={`mobile-${item.role}-${item.attempt}`} onClick={() => announce(`${item.action} will be connected in the next step.`)}>
                  <div className="mobile-row-top"><strong>{item.role}</strong><span className={`table-status ${item.kind}`}><span />{item.status}</span></div>
                  <p>{item.company} · Attempt {item.attempt}</p>
                  <div className="mobile-row-bottom"><span>{item.date}</span><strong>{item.score}</strong></div>
                </button>
              ))}
            </div>
            <div className="table-footer"><span>Showing <strong>3</strong> of <strong>4</strong> sessions</span><button onClick={() => setActive('Interview history')}>See all interviews <ChevronRight size={15} /></button></div>
          </section> */}
          <section className="card interviews-card">
  <div className="table-heading">
    <div>
      <div className="section-kicker">YOUR PRACTICE</div>
      <h2>Recent interviews</h2>
    </div>

    <button
      className="text-button"
      onClick={() => setActive('Interview history')}
    >
      View all history <ArrowRight size={15} />
    </button>
  </div>

  <div className="empty-interviews">
    <div className="empty-interviews-icon">
      <History size={26} />
    </div>

    <h3>No interviews yet</h3>

    <p>
      Your interview sessions will appear here once you start
      practicing.
    </p>

    <button
      className="dark-button"
      onClick={() => setActive('New interview')}
    >
      Start your first interview <ArrowRight size={16} />
    </button>
  </div>

  <div className="table-footer">
    <span>Showing <strong>0</strong> interviews</span>
    <button onClick={() => setActive('Interview history')}>
      See all interviews <ChevronRight size={15} />
    </button>
  </div>
</section>

          <footer className="page-footer">
            <LockKeyhole size={14} />
            <span>Your preparation data is private and visible only to you.</span>
            <span className="footer-divider">·</span>
            <span>Practice, learn, improve.</span>
          </footer>
          </> : active === 'Resumes' ? <section className="inner-page">
            <div className="page-heading">
              <div><div className="eyebrow">DOCUMENT LIBRARY <span className="eyebrow-line" /></div><h1>Resumes</h1><p className="subtitle">Upload your experience. Sparr uses extracted skills to tailor technical questions.</p></div>
            </div>

            <div className="card upload-card">
              <div className="section-kicker">UPLOAD A RESUME</div>
              <h2>Add a new resume</h2>
              <p className="muted">PDF or plain text (.txt) only · Maximum 5 MB per file</p>
              <label className="upload-drop">
                <FileText size={28} />
                <strong>{uploadBusy ? 'Uploading resume…' : 'Choose a PDF or TXT file'}</strong>
                <span>{uploadBusy ? 'Please wait' : 'Click to browse your computer'}</span>
                <input type="file" accept=".pdf,.txt,application/pdf,text/plain" disabled={uploadBusy} onChange={handleResumeUpload} />
              </label>
              <p className="muted small-note">Your file will be uploaded securely and queued for skill extraction.</p>
            </div>

            <div className="section-header">
              <div><div className="section-kicker">SAVED DOCUMENTS</div><h2>Your resumes <span className="count-pill">{resumes.length}</span></h2></div>
              <button className="text-button" onClick={fetchResumes} disabled={resumesLoading || uploadBusy}>Refresh</button>
            </div>

            {resumesLoading && <div className="card empty-state"><p>Loading your resumes…</p></div>}
            {resumesError && <div className="card empty-state" role="alert"><p>{resumesError}</p><button className="outline-button" onClick={fetchResumes}>Try again</button></div>}
            {!resumesLoading && !resumesError && resumes.length === 0 && (
              <div className="card empty-state"><FileText size={24} /><h2>No resumes yet</h2><p>Upload your first PDF or TXT resume to get started.</p></div>
            )}

            {!resumesLoading && !resumesError && resumes.length > 0 && (
              <div className="resume-list">
                {resumes.map(resume => (
                  <article className={`card resume-card ${selectedResume === resume.id ? 'resume-selected' : ''}`} key={resume.id}>
                    <div className="resume-file-icon"><FileText size={22} /></div>
                    <div className="resume-details">
                      <h3>{resume.title}</h3>
                      <p>{formatResumeDate(resume.created_at)}</p>
                      <div className="skill-chips"><span>{resumeStatusLabel(resume.parsing_status)}</span></div>
                      {resume.processing_error && <small role="alert">{resume.processing_error}</small>}
                    </div>
                    <div className="resume-actions">
                      <span className="ready-pill">
                        {resume.parsing_status === 'completed' ? <CircleCheck size={14} /> : <Sparkles size={14} />}
                        {resumeStatusLabel(resume.parsing_status)}
                      </span>
                      <button className="outline-button" onClick={() => setSelectedResume(resume.id)}>
                        {selectedResume === resume.id ? 'Selected' : 'Select resume'}
                      </button>

                      <button
  className="outline-button"
  onClick={() => {
    setSelectedResume(resume.id);
    fetchResumeDetails(resume.id);
  }}
>
  View skills
</button>
                    </div>
                  </article>
                ))}
              </div>
            )}

{resumeDetailsLoading && (
  <div className="card empty-state">
    <p>Loading extracted skills...</p>
  </div>
)}

{resumeDetailsError && (
  <div className="card empty-state" role="alert">
    <p>{resumeDetailsError}</p>
  </div>
)}

{resumeDetails && (
  <section className="card job-form-card">
    <div className="section-header">
      <div>
        <div className="section-kicker">AI RESUME ANALYSIS</div>
        <h2>Extracted Skills</h2>
        <p className="muted">
          {resumeDetails.skills?.length || 0} skills detected
        </p>
      </div>
    </div>

    {resumeDetails.skills?.length > 0 ? (
      Object.entries(
        resumeDetails.skills.reduce((groups, skill) => {
          const category = skill.category || 'other';

          if (!groups[category]) {
            groups[category] = [];
          }

          groups[category].push(skill);

          return groups;
        }, {})
      ).map(([category, skills]) => (
        <div className="resume-skill-group" key={category}>
          <h3>{category.replace(/_/g, ' ')}</h3>

          <div className="skill-chips">
            {skills.map(skill => (
              <span key={skill.id}>
                {skill.name}
                {' · '}
                {/* {Math.round(skill.confidence_score * 100)}% */}
                {typeof skill.confidence_score === 'number'
  ? `${Math.round(skill.confidence_score * 100)}%`
  : '—'}

              </span>
            ))}
          </div>
        </div>
      ))
    ) : (
      <p className="muted">No skills were extracted from this resume.</p>
    )}
  </section>
)}


            <div className="notice-card">
              <LockKeyhole size={18} />
              <div>
                <strong>Your documents stay private</strong>
                <p>Only you can access your resumes. Resume deletion and file preview are not currently available.</p>
              </div>
            </div>
          </section> : active === 'Job descriptions' ? <section className="inner-page">
            <div className="page-heading job-page-heading">
              <div><div className="eyebrow">TARGET ROLE LIBRARY <span className="eyebrow-line" /></div><h1>Job descriptions</h1><p className="subtitle">Save target roles and extract the skills needed for each opportunity.</p></div>
              <button className="primary-button" onClick={() => setJobFormOpen(value => !value)}><Plus size={18}/>{jobFormOpen ? 'Close form' : 'Add job description'}</button>
            </div>
            {jobFormOpen && <form className="card job-form-card" onSubmit={saveJob}>
              <div className="section-header"><div><div className="section-kicker">NEW TARGET ROLE</div><h2>Add a job description</h2></div><button type="button" className="icon-button close-form" aria-label="Close form" onClick={resetJobForm}><X size={18}/></button></div>
              <div className="job-form-grid">
                <label className="field-label">Job title *<input required maxLength={255} value={jobForm.title} onChange={e=>setJobForm(v=>({...v,title:e.target.value}))} placeholder="e.g. Junior React Developer" /></label>
                <label className="field-label">Company *<input required value={jobForm.company} onChange={e=>setJobForm(v=>({...v,company:e.target.value}))} placeholder="e.g. Acme Technologies" /></label>
                <label className="field-label field-full">Job description / requirements *<textarea required rows={6} value={jobForm.description} onChange={e=>setJobForm(v=>({...v,description:e.target.value}))} placeholder="Paste the job responsibilities, required skills, qualifications, and technologies..." /></label>
              </div>
              <div className="form-footer"><span className="muted">The description will be sent for AI skill extraction.</span><div><button type="button" className="outline-button" onClick={resetJobForm}>Cancel</button><button className="primary-button" type="submit" disabled={jobSaveBusy}><CircleCheck size={16}/>{jobSaveBusy ? 'Saving…' : 'Save job description'}</button></div></div>
            </form>}
            <div className="job-toolbar"><div className="search-field"><Search size={17}/><input value={jobSearch} onChange={e=>setJobSearch(e.target.value)} placeholder="Search by role or company..." aria-label="Search job descriptions" /></div><span className="count-pill">{jobDescriptions.length} saved</span><button className="text-button" onClick={fetchJobDescriptions} disabled={jobsLoading}>Refresh</button></div>
            {jobsLoading && <div className="card empty-state"><p>Loading job descriptions…</p></div>}
            {jobsError && <div className="card empty-state" role="alert"><p>{jobsError}</p><button className="outline-button" onClick={fetchJobDescriptions}>Try again</button></div>}
            {!jobsLoading && !jobsError && jobDescriptions.length === 0 && <div className="card empty-state"><Building2 size={24}/><h2>No job descriptions yet</h2><p>Add your first target role to extract its required skills.</p></div>}
            {!jobsLoading && !jobsError && <div className="job-list">{jobDescriptions.filter(job=>`${job.title} ${job.company_name}`.toLowerCase().includes(jobSearch.toLowerCase())).map(job=><article className={`card job-card ${selectedJobId === job.id ? 'resume-selected' : ''}`} key={job.id}>
              <div className="job-card-icon"><Building2 size={22}/></div><div className="job-card-content"><div className="job-card-title-row"><div><h2>{job.title}</h2><p className="job-company">{job.company_name}</p></div><span className="ready-pill">{job.parsing_status || 'Unknown'}</span></div><div className="job-card-meta"><span><FileText size={13}/> Added {formatResumeDate(job.created_at)}</span></div></div><div className="job-card-actions"><button className="outline-button" onClick={()=>setSelectedJobId(job.id)}>{selectedJobId === job.id ? 'Selected' : 'View details'}</button></div>
            </article>)}{jobDescriptions.filter(job=>`${job.title} ${job.company_name}`.toLowerCase().includes(jobSearch.toLowerCase())).length===0 && <div className="card empty-state"><Search size={24}/><h2>No matching job descriptions</h2><p>Try a different search, or add a new target role.</p></div>}</div>}
            {selectedJobId && <div className="card job-form-card"><div className="section-header"><div><div className="section-kicker">JOB DETAILS</div><h2>{selectedJobDetails?.title || 'Selected job description'}</h2></div><button className="text-button" onClick={()=>fetchJobDetails(selectedJobId)} disabled={jobDetailsLoading}>Refresh details</button></div>
              {jobDetailsLoading && !selectedJobDetails && <p className="muted">Loading job details…</p>}
              {selectedJobDetails && <><p className="job-company">{selectedJobDetails.company_name}</p><span className="ready-pill">{selectedJobDetails.parsing_status}</span><p className="job-description-preview">{selectedJobDetails.description}</p><h3>Extracted skills</h3>
                {selectedJobDetails.skills?.length ? <div className="skill-chips">{selectedJobDetails.skills.map(skill=><span key={skill.id}>{skill.name} · {skill.category} · {Math.round((skill.importance || 0)*100)}%</span>)}</div> : <p className="muted">{selectedJobDetails.parsing_status === 'failed' ? 'Skill extraction failed. Please contact the backend team.' : 'No skills extracted yet. This section refreshes automatically while extraction is pending.'}</p>}
              </>}




            </div>}

<button
  className="primary-button"
  onClick={() => fetchGapAnalysis(selectedJobId, selectedResume)}
  disabled={!selectedJobId || !selectedResume || gapAnalysisLoading}
>
  {gapAnalysisLoading ? 'Analyzing...' : 'Analyze Skill Gap'}
</button>


{gapAnalysisError && (
  <div className="card empty-state" role="alert">
    <p>{gapAnalysisError}</p>
  </div>
)}

{gapAnalysisLoading && (
  <div className="card empty-state">
    <p>Analyzing your skills...</p>
  </div>
)}

{gapAnalysis && (
  <section className="card job-form-card">
    <div className="section-header">
      <div>
        <div className="section-kicker">AI SKILL ANALYSIS</div>
        <h2>Skill Gap Analysis</h2>
        <p className="muted">
          {gapAnalysis.matching_skills_count} matching skills ·{' '}
          {gapAnalysis.missing_skills_count} missing skills
        </p>
      </div>
    </div>

    <div className="match-score">
      <h3>Overall Match</h3>
      <div className="match-percentage">
        {gapAnalysis.match_percentage}%
      </div>
    </div>

    <div className="resume-skill-group">
      <h3>Matching Skills</h3>

      <div className="skill-chips">
        {gapAnalysis.matching_skills?.map(skill => (
          <span key={skill.id}>
            {skill.name} · {Math.round(skill.candidate_confidence * 100)}%
          </span>
        ))}
      </div>
    </div>

    <div className="resume-skill-group">
      <h3>Missing Skills</h3>

      <div className="skill-chips">
        {gapAnalysis.missing_skills?.map(skill => (
          <span key={skill.id}>
            {skill.name}
          </span>
        ))}
      </div>
    </div>
  </section>
)}


            <div className="notice-card"><LockKeyhole size={18}/><div><strong>Your job descriptions stay private</strong><p>Descriptions and extracted skills are loaded from your account. Editing and deletion are not available through the documented APIs.</p></div></div>
          </section> 
          // : <section className="inner-page"><div className="page-heading"><div><div className="eyebrow">SPARR WORKSPACE <span className="eyebrow-line" /></div><h1>{active}</h1><p className="subtitle">{active === 'New interview' ? 'Choose your resume and target role to begin a new practice attempt.' : active === 'Interview history' ? 'Review your past attempts and track your progress.' : active === 'Profile & settings' ? 'Manage your profile and account preferences.' : 'Review your skill gaps before starting your interview.'}</p></div></div><div className="card placeholder-workspace"><div className="placeholder-icon"><Sparkles size={24}/></div><h2>{active === 'New interview' ? 'Start a personalized practice session' : `Let’s build ${active.toLowerCase()}`}</h2><p className="muted">This section is next in the development plan. Your dashboard, resume library, and job-description library are available now. Backend features such as authentication and AI skill extraction will be connected separately.</p><div className="placeholder-actions"><button className="outline-button" onClick={()=>setActive('Resumes')}>View resumes <ArrowRight size={15}/></button><button className="outline-button" onClick={()=>setActive('Job descriptions')}>View job descriptions <ArrowRight size={15}/></button><button className="primary-button" onClick={()=>setActive('Dashboard')}>Back to dashboard</button></div></div></section>}
       : active === 'Interview history' ? (
  <section className="inner-page">
    <div className="page-heading">
      <div>
        <div className="eyebrow">
          SPARR WORKSPACE <span className="eyebrow-line" />
        </div>
        <h1>Interview history</h1>
        <p className="subtitle"         style={{marginBottom:30}}
>
          Review your past attempts and track your progress.
        </p>
      </div>
      <button
        className="primary-button"
        onClick={() => setActive('New interview')}
        style={{marginBottom:30}}
      >
        <Plus size={18} /> New interview
      </button>
    </div>

    <section className="history-stats">
      <div className="card history-stat-card">
        <span>Total sessions</span>
        <strong>0</strong>
        <p>No sessions yet</p>
      </div>

      <div className="card history-stat-card">
        <span>Completed</span>
        <strong>0</strong>
        <p>Completed attempts</p>
      </div>

      <div className="card history-stat-card">
        <span>Average score</span>
        <strong>—</strong>
        <p>Based on completed reports</p>
      </div>
    </section>

    <section className="card history-content">
      <div className="table-heading">
        <div>
          <div className="section-kicker">YOUR PRACTICE</div>
          <h2>All interview sessions</h2>
        </div>
      </div>

      <div className="history-empty-state">
        <div className="empty-interviews-icon">
          <History size={26} />
        </div>

        <h3>No interview sessions yet</h3>

        <p>
          Your interview attempts will appear here.
          Start your first practice session to begin tracking your progress.
        </p>

        <button
          className="dark-button"
          onClick={() => setActive('New interview')}
        >
          Start your first interview <ArrowRight size={16} />
        </button>
      </div>
    </section>
  </section>
) : <section className="inner-page">
  <div className="page-heading">
    <div>
      <div className="eyebrow">
        SPARR WORKSPACE <span className="eyebrow-line" />
      </div>
      <h1>{active}</h1>
      <p className="subtitle">
        {active === 'New interview'
          ? 'Choose your resume and target role to begin a new practice attempt.'
          : active === 'Profile & settings'
            ? 'Manage your profile and account preferences.'
            : 'Review your skill gaps before starting your interview.'}
      </p>
    </div>
  </div>

  {/* <div className="card placeholder-workspace">
    <div className="placeholder-icon">
      <Sparkles size={24} />
    </div>

    <h2>
      {active === 'New interview'
        ? 'Start a personalized practice session'
        : `Let’s build ${active.toLowerCase()}`}
    </h2>

    <p className="muted">
      This section is next in the development plan.
      Your dashboard, resume library, and job-description library
      are available now. Backend features will be connected separately.
    </p>

    <div className="placeholder-actions">
      <button
        className="outline-button"
        onClick={() => setActive('Resumes')}
      >
        View resumes <ArrowRight size={15} />
      </button>

      <button
        className="outline-button"
        onClick={() => setActive('Job descriptions')}
      >
        View job descriptions <ArrowRight size={15} />
      </button>

      <button
        className="primary-button"
        onClick={() => setActive('Dashboard')}
      >
        Back to dashboard
      </button>
    </div>
  </div> */}
  {active === 'Profile & settings' ? (
  <div className="profile-settings">

    <section className="card profile-card">
      <div className="section-kicker">YOUR ACCOUNT</div>

      <div className="profile-user">
        <div className="profile-avatar">{initials}</div>

        <div>
          <h2>{displayName}</h2>
          <p className="muted">
            {currentUser?.email || 'Email not available'}
          </p>
        </div>
      </div>
    </section>

    <section className="card settings-card">
      <div className="section-kicker">ACCOUNT INFORMATION</div>
      <h2>Personal information</h2>

      <div className="profile-fields">
        <div className="profile-field">
          <label>Full name</label>
          <div>{displayName || 'Not available'}</div>
        </div>

        <div className="profile-field">
          <label>Email address</label>
          <div>{currentUser?.email || 'Not available'}</div>
        </div>
      </div>
    </section>

    <section className="card settings-card">
      <div className="section-kicker">PREFERENCES</div>
      <h2>Account preferences</h2>

      <div className="setting-row">
        <div>
          <strong>Email notifications</strong>
          <p className="muted">Notification preferences will be available soon.</p>
        </div>
        <span className="coming-soon">Coming soon</span>
      </div>

      <div className="setting-row">
        <div>
          <strong>Password & security</strong>
          <p className="muted">Manage your password and account security.</p>
        </div>
        <span className="coming-soon">Coming soon</span>
      </div>
    </section>

    <div className="profile-back">
      <button
        className="outline-button"
        onClick={() => setActive('Dashboard')}
      >
        Back to dashboard <ArrowRight size={15} />
      </button>
    </div>

  </div>
) : (
  <div className="card placeholder-workspace">
    <div className="placeholder-icon">
      <Sparkles size={24} />
    </div>

    <h2>
      {active === 'New interview'
        ? 'Start a personalized practice session'
        : `Let’s build ${active.toLowerCase()}`}
    </h2>

    <p className="muted">
      This section is next in the development plan.
      Your dashboard, resume library, and job-description library
      are available now. Backend features will be connected separately.
    </p>

    <div className="placeholder-actions">
      <button
        className="outline-button"
        onClick={() => setActive('Resumes')}
      >
        View resumes <ArrowRight size={15} />
      </button>

      <button
        className="outline-button"
        onClick={() => setActive('Job descriptions')}
      >
        View job descriptions <ArrowRight size={15} />
      </button>

      <button
        className="primary-button"
        onClick={() => setActive('Dashboard')}
      >
        Back to dashboard
      </button>
    </div>
  </div>
)}
</section>}
          </main>
      </div>
      {notice && <div className="toast" role="status"><CircleCheck size={17} />{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={15} /></button></div>}
    </div>
  );
}

export default App;




import React, { useState } from 'react';
import AuthPage from './AuthPage';
import {
  LayoutDashboard, FileText, BriefcaseBusiness, History, Settings,
  BookOpen, Plus, ArrowUpRight, ArrowRight, Menu, X, ChevronRight,
  CircleCheck, LockKeyhole, Sparkles, Search, Pencil, Trash2, Building2, XCircle
} from 'lucide-react';

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
  const [resumes, setResumes] = useState([
    { id: 1, name: 'Maya_Chen_Backend_v2.pdf', size: '248 KB', version: 'v2', date: '17 Oct 2026', skills: ['Python', 'SQL', 'REST APIs', 'PostgreSQL', 'Git', 'Unit testing'], used: 2 },
    { id: 2, name: 'Maya_Chen_Backend_v1.pdf', size: '232 KB', version: 'v1', date: '10 Oct 2026', skills: ['Python', 'SQL', 'Git'], used: 1 },
    { id: 3, name: 'Maya_notes.txt', size: '4 KB', version: 'Draft', date: '19 Oct 2026', skills: ['JavaScript', 'React'], used: 0 },
  ]);
  const [selectedResume, setSelectedResume] = useState(1);
  const [jobDescriptions, setJobDescriptions] = useState([
    { id: 1, title: 'Backend Engineer', company: 'Northstar Labs', location: 'Remote', type: 'Full-time', date: '18 Oct 2026', version: 3, used: 2, description: 'Build and maintain scalable REST APIs using Python and Django. Work with PostgreSQL, caching, queues, testing, and cloud deployment. Explain trade-offs around reliability, security, and performance.' },
    { id: 2, title: 'Frontend Engineer', company: 'Harbor Studio', location: 'Hybrid', type: 'Full-time', date: '15 Oct 2026', version: 1, used: 1, description: 'Develop accessible responsive interfaces with React and TypeScript. Collaborate with designers, integrate APIs, write tests, and improve web performance.' },
  ]);
  const [jobSearch, setJobSearch] = useState('');
  const [jobFormOpen, setJobFormOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [jobForm, setJobForm] = useState({ title: '', company: '', location: 'Remote', type: 'Full-time', description: '' });

  const resetJobForm = () => {
    setJobForm({ title: '', company: '', location: 'Remote', type: 'Full-time', description: '' });
    setEditingJobId(null);
    setJobFormOpen(false);
  };

  const startEditJob = (job) => {
    setJobForm({ title: job.title, company: job.company, location: job.location, type: job.type, description: job.description });
    setEditingJobId(job.id);
    setJobFormOpen(true);
  };

  const saveJob = (event) => {
    event.preventDefault();
    const title = jobForm.title.trim();
    const company = jobForm.company.trim();
    const description = jobForm.description.trim();
    if (!title || !company || !description) {
      announce('Please fill in the role title, company, and job description.');
      return;
    }
    if (editingJobId !== null) {
      setJobDescriptions(prev => prev.map(job => job.id === editingJobId
        ? { ...job, ...jobForm, title, company, description, version: job.version + 1, date: 'Just now' }
        : job));
      announce('Job description updated. A new version snapshot was created in this demo.');
    } else {
      setJobDescriptions(prev => [{ id: Date.now(), ...jobForm, title, company, description, version: 1, date: 'Just now', used: 0 }, ...prev]);
      announce('Job description saved.');
    }
    resetJobForm();
  };

  const announce = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3200);
    setMenuOpen(false);
  };

  if (!currentUser) return <AuthPage onAuthenticated={(user) => { setCurrentUser(user); setActive('Dashboard'); }} />;

  const displayName = currentUser?.name || currentUser?.email?.split('@')[0] || 'User';
  const initials = displayName.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="app-shell">
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
              <p className="subtitle">Build confidence for your next Backend Engineer interview.</p>
            </div>
            <button className="primary-button" onClick={() => setActive('New interview')}>
              <Plus size={18} /> New interview
            </button>
          </div>

          <div className="overview-row">
            <span>Your preparation overview</span>
            <span className="date-label">Tuesday, 20 October 2026</span>
          </div>

          <section className="next-step card">
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
          </section>

          <section className="journey-grid" aria-label="Preparation steps">
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
          </section>

          <section className="stats-grid">
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
          </section>

          <section className="insights-grid">
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
          </section>

          <section className="card interviews-card">
            <div className="table-heading">
              <div><div className="section-kicker">YOUR PRACTICE</div><h2>Recent interviews</h2></div>
              <button className="text-button" onClick={() => {setActive('Interview history'); announce('Interview history page is a placeholder for the next development step.');}}>View all history <ArrowRight size={15} /></button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>Target role</th><th>Attempt</th><th>Status</th><th>Score</th><th></th></tr></thead>
                <tbody>
                  {interviews.map((item) => <tr key={`${item.date}-${item.role}-${item.attempt}`}>
                    <td><span className="date-cell">{item.date}</span></td>
                    <td><div className="role-cell">{item.role}</div><div className="company-cell">{item.company}</div></td>
                    <td><span className="attempt-badge">{item.attempt}</span></td>
                    <td><span className={`table-status ${item.kind}`}><span />{item.status}</span></td>
                    <td><span className={item.kind === 'completed' ? 'score-value' : 'score-pending'}>{item.score}</span></td>
                    <td><button className="row-action" onClick={() => announce(`${item.action} will be connected in the next step.`)}>{item.action}<ArrowUpRight size={14} /></button></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
            <div className="mobile-interviews">
              {interviews.map((item) => <button className="mobile-interview-row" key={`mobile-${item.role}-${item.attempt}`} onClick={() => announce(`${item.action} will be connected in the next step.`)}>
                <div className="mobile-row-top"><strong>{item.role}</strong><span className={`table-status ${item.kind}`}><span />{item.status}</span></div>
                <p>{item.company} · Attempt {item.attempt}</p><div className="mobile-row-bottom"><span>{item.date}</span><strong>{item.score}</strong></div>
              </button>)}
            </div>
            <div className="table-footer"><span>Showing <strong>3</strong> of <strong>4</strong> sessions</span><button onClick={() => announce('More interview history will be available on the history page.')}>See all interviews <ChevronRight size={15} /></button></div>
          </section>

          <footer className="page-footer"><LockKeyhole size={14} /><span>Your preparation data is private and visible only to you.</span><span className="footer-divider">·</span><span>Practice, learn, improve.</span></footer>
          </> : active === 'Resumes' ? <section className="inner-page">
            <div className="page-heading"><div><div className="eyebrow">DOCUMENT LIBRARY <span className="eyebrow-line" /></div><h1>Resumes</h1><p className="subtitle">Upload your experience. Sparr uses extracted skills to tailor technical questions.</p></div></div>
            <div className="card upload-card"><div className="section-kicker">UPLOAD A RESUME</div><h2>Add a new resume</h2><p className="muted">PDF or plain text (.txt) only · Maximum 5 MB per file</p><label className="upload-drop"><FileText size={28}/><strong>Choose a PDF or TXT file</strong><span>Click to browse your computer</span><input type="file" accept=".pdf,.txt,application/pdf,text/plain" onChange={(e) => { const f=e.target.files?.[0]; if(!f)return; if(!/\.(pdf|txt)$/i.test(f.name)){announce('Unsupported file type. Please choose a PDF or .txt file.');e.target.value='';return;} if(f.size>5*1024*1024){announce('This file exceeds the 5 MB limit. Choose a smaller file.');e.target.value='';return;} const next={id:Date.now(),name:f.name,size:f.size<1024*1024?`${Math.max(1,Math.round(f.size/1024))} KB`:`${(f.size/1024/1024).toFixed(1)} MB`,version:'New',date:'Just now',skills:[],used:0};setResumes(prev=>[next,...prev]);setSelectedResume(next.id);announce('File added to this demo. Skill extraction requires backend integration.');e.target.value='';}} /></label><p className="muted small-note">A new upload creates a new version. Past interviews should keep the resume version used when they were created.</p></div>
            <div className="section-header"><div><div className="section-kicker">SAVED DOCUMENTS</div><h2>Your resumes <span className="count-pill">{resumes.length}</span></h2></div></div>
            <div className="resume-list">{resumes.map(r=><article className={`card resume-card ${selectedResume===r.id?'resume-selected':''}`} key={r.id}><div className="resume-file-icon"><FileText size={22}/></div><div className="resume-details"><h3>{r.name}</h3><p>{r.size} <span>·</span> {r.version} <span>·</span> {r.date}</p><div className="skill-chips">{r.skills.length?r.skills.map(skill=><span key={skill}>{skill}</span>):<span>Skills not analyzed yet</span>}</div><small>{r.used?`Used in ${r.used} interview session${r.used>1?'s':''} · protected from deletion`:'Not used in interviews'}</small></div><div className="resume-actions"><span className="ready-pill"><CircleCheck size={14}/> {r.skills.length?'Ready':'Added'}</span><button className="outline-button" onClick={()=>setSelectedResume(r.id)}>{selectedResume===r.id?'Selected':'Select resume'}</button>{!r.used&&<button className="text-button danger-text" onClick={()=>{setResumes(prev=>prev.filter(x=>x.id!==r.id));if(selectedResume===r.id)setSelectedResume(resumes.find(x=>x.id!==r.id)?.id??null);announce('Resume removed from this demo.')}}>Delete</button>}</div></article>)}</div>
            <div className="notice-card"><LockKeyhole size={18}/><div><strong>Your documents stay private</strong><p>Resumes already used by an interview cannot be deleted, so historical sessions can preserve their original context.</p></div></div>
          </section> : active === 'Job descriptions' ? <section className="inner-page">
            <div className="page-heading job-page-heading"><div><div className="eyebrow">TARGET ROLE LIBRARY <span className="eyebrow-line" /></div><h1>Job descriptions</h1><p className="subtitle">Save the roles you want to prepare for. Each edit creates a new version for future practice sessions.</p></div><button className="primary-button" onClick={() => { setJobForm({ title: '', company: '', location: 'Remote', type: 'Full-time', description: '' }); setEditingJobId(null); setJobFormOpen(!jobFormOpen); }}><Plus size={18}/>{jobFormOpen && editingJobId === null ? 'Close form' : 'Add job description'}</button></div>
            {jobFormOpen && <form className="card job-form-card" onSubmit={saveJob}>
              <div className="section-header"><div><div className="section-kicker">{editingJobId !== null ? 'EDIT SAVED ROLE' : 'NEW TARGET ROLE'}</div><h2>{editingJobId !== null ? 'Update job description' : 'Add a job description'}</h2></div><button type="button" className="icon-button close-form" aria-label="Close form" onClick={resetJobForm}><X size={18}/></button></div>
              <div className="job-form-grid">
                <label className="field-label">Job title *<input required value={jobForm.title} onChange={e=>setJobForm(v=>({...v,title:e.target.value}))} placeholder="e.g. Junior React Developer" /></label>
                <label className="field-label">Company *<input required value={jobForm.company} onChange={e=>setJobForm(v=>({...v,company:e.target.value}))} placeholder="e.g. Acme Technologies" /></label>
                <label className="field-label">Work arrangement<select value={jobForm.location} onChange={e=>setJobForm(v=>({...v,location:e.target.value}))}><option>Remote</option><option>Hybrid</option><option>On-site</option><option>Flexible</option></select></label>
                <label className="field-label">Employment type<select value={jobForm.type} onChange={e=>setJobForm(v=>({...v,type:e.target.value}))}><option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option><option>Trainee</option></select></label>
                <label className="field-label field-full">Job description / requirements *<textarea required rows={6} value={jobForm.description} onChange={e=>setJobForm(v=>({...v,description:e.target.value}))} placeholder="Paste the job responsibilities, required skills, qualifications, and technologies..." /></label>
              </div>
              <div className="form-footer"><span className="muted">Keep the original requirements as accurate as possible.</span><div><button type="button" className="outline-button" onClick={resetJobForm}>Cancel</button><button className="primary-button" type="submit"><CircleCheck size={16}/>{editingJobId !== null ? 'Save new version' : 'Save job description'}</button></div></div>
            </form>}
            <div className="job-toolbar"><div className="search-field"><Search size={17}/><input value={jobSearch} onChange={e=>setJobSearch(e.target.value)} placeholder="Search by role or company..." aria-label="Search job descriptions" /></div><span className="count-pill">{jobDescriptions.length} saved</span></div>
            <div className="job-list">{jobDescriptions.filter(job=>`${job.title} ${job.company} ${job.description}`.toLowerCase().includes(jobSearch.toLowerCase())).map(job=><article className="card job-card" key={job.id}><div className="job-card-icon"><Building2 size={22}/></div><div className="job-card-content"><div className="job-card-title-row"><div><h2>{job.title}</h2><p className="job-company">{job.company} <span>·</span> {job.location} <span>·</span> {job.type}</p></div><span className="version-pill">v{job.version}</span></div><p className="job-description-preview">{job.description}</p><div className="job-card-meta"><span><FileText size={13}/> Updated {job.date}</span><span><History size={13}/> {job.used ? `Used in ${job.used} interview session${job.used > 1 ? 's' : ''}` : 'Not used in interviews'}</span></div></div><div className="job-card-actions"><button className="outline-button" onClick={()=>startEditJob(job)}><Pencil size={14}/> Edit</button>{!job.used && <button className="text-button danger-text" onClick={()=>{setJobDescriptions(prev=>prev.filter(item=>item.id!==job.id));announce('Job description deleted from this demo.')}}><Trash2 size={14}/> Delete</button>}</div></article>)}
              {jobDescriptions.filter(job=>`${job.title} ${job.company} ${job.description}`.toLowerCase().includes(jobSearch.toLowerCase())).length===0 && <div className="card empty-state"><Search size={24}/><h2>No matching job descriptions</h2><p>Try a different search, or add a new target role.</p></div>}
            </div>
            <div className="notice-card"><LockKeyhole size={18}/><div><strong>Version history matters</strong><p>When a job description is edited, the version number increases. In the full application, each interview will be linked to the exact job-description version used to create it.</p></div></div>
          </section> : <section className="inner-page"><div className="page-heading"><div><div className="eyebrow">SPARR WORKSPACE <span className="eyebrow-line" /></div><h1>{active}</h1><p className="subtitle">{active === 'New interview' ? 'Choose your resume and target role to begin a new practice attempt.' : active === 'Interview history' ? 'Review your past attempts and track your progress.' : active === 'Profile & settings' ? 'Manage your profile and account preferences.' : 'Review your skill gaps before starting your interview.'}</p></div></div><div className="card placeholder-workspace"><div className="placeholder-icon"><Sparkles size={24}/></div><h2>{active === 'New interview' ? 'Start a personalized practice session' : `Let’s build ${active.toLowerCase()}`}</h2><p className="muted">This section is next in the development plan. Your dashboard, resume library, and job-description library are available now. Backend features such as authentication and AI skill extraction will be connected separately.</p><div className="placeholder-actions"><button className="outline-button" onClick={()=>setActive('Resumes')}>View resumes <ArrowRight size={15}/></button><button className="outline-button" onClick={()=>setActive('Job descriptions')}>View job descriptions <ArrowRight size={15}/></button><button className="primary-button" onClick={()=>setActive('Dashboard')}>Back to dashboard</button></div></div></section>}
        </main>
      </div>
      {notice && <div className="toast" role="status"><CircleCheck size={17} />{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={15} /></button></div>}
    </div>
  );
}

export default App;
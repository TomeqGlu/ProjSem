import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Application, JobWithApplication } from '../types';

export function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [job, setJob] = useState<JobWithApplication | null>(null);
  const [userApplication, setUserApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);//Jeżeli przekaze obiejkt do tab referencji to porównuje stale stringi i nie wywołuje useEffect, jeżeli zmieni się obiekt. 
  // Jeżeli przekaże tablicę z referencją do obiektu to useEffect wywoła się przy zmianie obiektu.

   useEffect(() => {
    if (job?.id) {
      updateJobDetails(job);
    }
  }, [job?.id, user?.id, profile?.id]);

  const fetchJobDetails = async () => {
    if (!id) return;
    setLoading(true);

    // Fetch job
    const { data: jobData } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', id)
      .single();

    if (!jobData) {
      setLoading(false);
      return;
    }

    setJob(jobData);
    setLoading(false);
  };

  const updateJobDetails = async (jobData: JobWithApplication) => {
    if (!jobData.id || !user?.id || !profile?.id) return;
    setLoading(true);


    const jobWithApps: JobWithApplication = { ...jobData };

    // If recruiter and is author
    if (user && profile?.role === 'recruiter' && jobData.recruiter_id === user.id) {
      const { data: appsData } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', jobData.id)
        .order('applied_at', { ascending: false });
      
      if (appsData) {
        jobWithApps.applications = appsData;
        jobWithApps.application_count = appsData.length;
      }
    }
    // If candidate, check if applied
    if (user && profile?.role === 'candidate') {
      const { data: appData } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', jobData.id)
        .eq('candidate_id', user.id)
        .single();

      if (appData) {
        setUserApplication(appData);
        jobWithApps.user_application = appData;
      }
    }

    setJob(jobWithApps);
    setLoading(false);
  };

  const handleStatusChange = async (applicationId: string, newStatus: Application['status']) => {
    if (!user || updatingStatus) return;
    setUpdatingStatus(true);

    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', applicationId);


    if (!error) {
      setJob(prev => {
        if (prev && prev.applications) {
          return {
            ...prev,
            applications: prev.applications.map(app => app.id === applicationId ? { ...app, status: newStatus } : app)
          };
        }
        return prev;
      });      
    }

    setUpdatingStatus(false);
  };

  const handleApply = () => {
    if (id) {
      navigate(`/jobs/${id}/apply`);
    }
  };

  if (loading) return <div className="loading">Ładowanie...</div>;
  if (!job) return <div className="error">Oferta nie istnieje</div>;

  const isRecruiterAndAuthor = user && profile?.role === 'recruiter' && job.recruiter_id === user.id;
  const isCandidate = user && profile?.role === 'candidate';  

  return (
    <div className="job-details">
      <div className="job-details__header">
        <Link to="/jobs" className="job-details__back">← Powrót do ofert</Link>
        
        {isRecruiterAndAuthor && (
          <div className="job-details__actions">
            <Link to={`/jobs/${id}/edit`} className="job-details__edit-btn">
              Edytuj ofertę
            </Link>
          </div>
        )}
      </div>

      <div className="job-details__content">
        <h1 className="job-details__title">{job.position}</h1>
        <div className="job-details__company">{job.company}</div>
        
        <div className="job-details__info">
          <span className="job-details__location">📍 {job.location}</span>
          <span className="job-details__salary">
            💰 ${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()}
          </span>
          <span className="job-details__date">
            📅 Dodano: {new Date(job.posted_at).toLocaleDateString('pl-PL')}
          </span>
        </div>

        <div className="job-details__description">
          <h3>Opis stanowiska</h3>
          <p>{job.description}</p>
        </div>

        {isRecruiterAndAuthor && job.applications && (
          <div className="job-details__applications">
            <h3>Aplikacje ({job.applications.length})</h3>
            {job.applications.length === 0 ? (
              <p>Brak aplikacji na tę ofertę.</p>
            ) : (
              <div className="job-details__applications-list">
                {job.applications.map(app => {
                  return (
                  <div key={app.id} className="job-details__application">
                    <div className="job-details__application-header">
                      <div className="job-details__application-info">
                        <span className="job-details__application-name">{app.applicant_name}</span>
                        <span className="job-details__application-email">{app.applicant_email}</span>
                        <span className="job-details__application-date">
                          {new Date(app.applied_at).toLocaleDateString('pl-PL')}
                        </span>
                      </div>
                      <div className="job-details__application-status">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value as Application['status'])}
                          className={`job-details__status-select job-details__status-select--${app.status}`}
                          disabled={updatingStatus}
                        >
                          <option value="pending">Oczekująca</option>
                          <option value="reviewed">Przejrzana</option>
                          <option value="accepted">Zaakceptowana</option>
                          <option value="rejected">Odrzucona</option>
                        </select>
                      </div>
                    </div>
                    {app.cover_letter && (
                      <details className="job-details__cover-letter">
                        <summary className="job-details__cover-letter-summary">
                          Pokaż list motywacyjny
                        </summary>
                        <p className="job-details__cover-letter-content">{app.cover_letter}</p>
                      </details>
                    )}
                  </div>
                )
                })}
              </div>
            )}
          </div>
        )}

        {isCandidate && (
          <div className="job-details__application-status">
            {userApplication ? (
              <div className={`job-details__status-badge job-details__status-badge--${userApplication.status}`}>
                Status aplikacji: {
                  { pending: 'Oczekująca', reviewed: 'Przejrzana', accepted: 'Zaakceptowana', rejected: 'Odrzucona' }[userApplication.status]
                }
              </div>
            ) : (
              <button onClick={handleApply} className="job-details__apply-btn">
                Aplikuj na to stanowisko
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuth } from '../hooks/useAuth';
import type { JobPosting, Application } from '../types';

export function Dashboard() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id && profile?.id) {
      fetchDashboardData();
    }
  }, [user?.id, profile?.id]);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);

    if (profile?.role === 'recruiter') {
      // Fetch recruiter's jobs with application counts
      const { data: jobsData } = await supabase
        .from('job_postings')
        .select('*')
        .eq('recruiter_id', user.id)
        .order('created_at', { ascending: false });

      if (jobsData) {
        const jobsWithCounts = await Promise.all(
          jobsData.map(async (job) => {
            const { count } = await supabase
              .from('applications')
              .select('*', { count: 'exact', head: true })
              .eq('job_id', job.id);
            
            return { ...job, application_count: count || 0 };
          })
        );
        setJobs(jobsWithCounts);
      }
    } else if (profile?.role === 'candidate') {
      // Fetch candidate's applications
      const { data: appsData } = await supabase
        .from('applications')
        .select('*, job_postings(*)')
        .eq('candidate_id', user.id)
        .order('applied_at', { ascending: false });

      if (appsData) {
        setApplications(appsData);
      }
    }

    setLoading(false);
  };

  if (loading) return <div className="loading">Ładowanie...</div>;

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Panel użytkownika</h1>

      {profile?.role === 'recruiter' ? (
        <div className="dashboard__section">
          <div className="dashboard__section-header">
            <h2 className="dashboard__section-title">Moje oferty</h2>
            <Link to="/jobs/new" className="dashboard__add-btn">
              + Nowa oferta
            </Link>
          </div>

          {jobs.length === 0 ? (
            <p className="dashboard__empty">Nie masz jeszcze żadnych ofert.</p>
          ) : (
            <div className="dashboard__job-list">
              {jobs.map(job => (
                <Link to={`/jobs/${job.id}`} key={job.id} className="dashboard__job-item">
                  <div className="dashboard__job-info">
                    <h3 className="dashboard__job-title">{job.position}</h3>
                    <span className="dashboard__job-company">{job.company}</span>
                    <span className="dashboard__job-location">📍 {job.location}</span>
                  </div>
                  <div className="dashboard__job-stats">
                    <span className="dashboard__job-applications">
                      📋 {job.application_count || 0} aplikacji
                    </span>
                    <span className={`dashboard__job-status dashboard__job-status--${job.is_active ? 'active' : 'inactive'}`}>
                      {job.is_active ? 'Aktywna' : 'Nieaktywna'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="dashboard__section">
          <h2 className="dashboard__section-title">Moje aplikacje</h2>

          {applications.length === 0 ? (
            <p className="dashboard__empty">Nie złożyłeś jeszcze żadnych aplikacji.</p>
          ) : (
            <div className="dashboard__application-list">
              {applications.map(app => {
                const job = app.job_postings;
                return (
                  <Link to={`/jobs/${app.job_id}`} key={app.id} className="dashboard__application-item">
                    <div className="dashboard__application-info">
                      <h3 className="dashboard__application-position">{job?.position || 'Brak danych'}</h3>
                      <span className="dashboard__application-company">{job?.company || ''}</span>
                      <span className="dashboard__application-date">
                        Aplikowano: {new Date(app.applied_at).toLocaleDateString('pl-PL')}
                      </span>
                    </div>
                    <div className={`dashboard__application-status dashboard__application-status--${app.status}`}>
                      {{
                        pending: 'Oczekująca',
                        reviewed: 'Przejrzana',
                        accepted: '✅ Zaakceptowana',
                        rejected: '❌ Odrzucona'
                      }[app.status]}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
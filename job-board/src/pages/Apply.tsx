import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuth } from '../hooks/useAuth';
import type { JobPosting } from '../types';

export function Apply() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    applicant_name: '',
    applicant_email: '',
    cover_letter: '',
  });
    

  useEffect(() => {        
    
    fetchJobAndProfile();
    
  }, [id, user?.id]);

  const fetchJobAndProfile = async () => {  
    if (!id || !user) return;
    
    // Fetch job
    const { data: jobData } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', id)
      .single();

    if (!jobData) {
      navigate('/jobs');
      return;
    }
        
    setJob(jobData);

    // Fetch user profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileData) {
      setForm(prev => ({
        ...prev,
        applicant_name: profileData.full_name || '',
        applicant_email: user.email || '',
      }));
    }

    // Check if already applied
    const { data: existingApp } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', id)
      .eq('candidate_id', user.id)
      .single();
    
    if (existingApp) {
      navigate(`/jobs/${id}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user || !profile || !job) {
      setError('Brak danych');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('applications')
      .insert({
        job_id: job.id,
        candidate_id: user.id,
        applicant_name: form.applicant_name,
        applicant_email: form.applicant_email,
        cover_letter: form.cover_letter,
        status: 'pending',
      });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    navigate(`/jobs/${id}`);
  };

  if (!user || profile?.role !== 'candidate') {
    return <div className="error">Brak dostępu</div>;
  }

  if (!job) return <div className="loading">Ładowanie...</div>;

  return (
    <div className="apply-page">
      <div className="apply-page__container">
        <Link to={`/jobs/${id}`} className="apply-page__back">← Powrót do oferty</Link>

        <div className="apply-page__header">
          <h1 className="apply-page__title">Aplikuj na stanowisko</h1>
          <div className="apply-page__job">
            <span className="apply-page__job-position">{job.position}</span>
            <span className="apply-page__job-company">{job.company}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="apply-page__form">
          <div className="apply-page__field">
            <label className="apply-page__label">Imię i nazwisko *</label>
            <input
              type="text"
              name="applicant_name"
              value={form.applicant_name}
              onChange={handleChange}
              className="apply-page__input"
              required
            />
          </div>

          <div className="apply-page__field">
            <label className="apply-page__label">Email *</label>
            <input
              type="email"
              name="applicant_email"
              value={form.applicant_email}
              onChange={handleChange}
              className="apply-page__input"
              required
            />
          </div>

          <div className="apply-page__field">
            <label className="apply-page__label">List motywacyjny *</label>
            <textarea
              name="cover_letter"
              value={form.cover_letter}
              onChange={handleChange}
              className="apply-page__textarea"
              rows={8}
              required
              placeholder="Napisz, dlaczego jesteś odpowiednim kandydatem na to stanowisko..."
            />
          </div>

          {error && <p className="apply-page__error">{error}</p>}

          <button type="submit" className="apply-page__submit" disabled={loading}>
            {loading ? 'Wysyłanie...' : 'Wyślij aplikację'}
          </button>
        </form>
      </div>
    </div>
  );
}
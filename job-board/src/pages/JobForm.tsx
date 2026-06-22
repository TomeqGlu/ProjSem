import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuth } from '../hooks/useAuth';

export function JobForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    company: '',
    position: '',
    location: '',
    salary_min: 3000,
    salary_max: 6000,
    description: '',
  });

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    if (!id) return;
    const { data } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      // Check if user is author
      if (user && data.recruiter_id !== user.id) {
        navigate('/jobs');
        return;
      }
      setForm({
        company: data.company,
        position: data.position,
        location: data.location,
        salary_min: data.salary_min,
        salary_max: data.salary_max,
        description: data.description || '',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name.startsWith('salary_') ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('Musisz być zalogowany');
      setLoading(false);
      return;
    }

    const jobData = {
      recruiter_id: user.id,
      ...form,
      is_active: true,
      posted_at: new Date().toISOString().split('T')[0],
    };

    let result;
    if (isEdit) {
      result = await supabase
        .from('job_postings')
        .update(jobData)
        .eq('id', id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('job_postings')
        .insert(jobData)
        .select()
        .single();
    }

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    navigate('/jobs');
  };

  const handleDeactivate = async () => {
    if (!id || !confirm('Czy na pewno chcesz dezaktywować tę ofertę?')) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('job_postings')
      .update({ is_active: false })
      .eq('id', id);
    
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      navigate('/jobs');
    }
  };

  if (!user || profile?.role !== 'recruiter') {
    return <div className="error">Brak dostępu</div>;
  }

  return (
    <div className="job-form-page">
      <div className="job-form-page__container">
        <Link to="/jobs" className="job-form-page__back">← Powrót do ofert</Link>
        
        <h1 className="job-form-page__title">
          {isEdit ? 'Edytuj ofertę' : 'Nowa oferta pracy'}
        </h1>

        <form onSubmit={handleSubmit} className="job-form-page__form">
          <div className="job-form-page__field">
            <label className="job-form-page__label">Firma *</label>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              className="job-form-page__input"
              required
            />
          </div>

          <div className="job-form-page__field">
            <label className="job-form-page__label">Stanowisko *</label>
            <input
              type="text"
              name="position"
              value={form.position}
              onChange={handleChange}
              className="job-form-page__input"
              required
            />
          </div>

          <div className="job-form-page__field">
            <label className="job-form-page__label">Lokalizacja *</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="job-form-page__input"
              required
            />
          </div>

          <div className="job-form-page__row">
            <div className="job-form-page__field">
              <label className="job-form-page__label">Pensja minimalna *</label>
              <input
                type="number"
                name="salary_min"
                value={form.salary_min}
                onChange={handleChange}
                className="job-form-page__input"
                min={0}
                required
              />
            </div>

            <div className="job-form-page__field">
              <label className="job-form-page__label">Pensja maksymalna *</label>
              <input
                type="number"
                name="salary_max"
                value={form.salary_max}
                onChange={handleChange}
                className="job-form-page__input"
                min={form.salary_min}
                required
              />
            </div>
          </div>

          <div className="job-form-page__field">
            <label className="job-form-page__label">Opis stanowiska</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="job-form-page__textarea"
              rows={6}
            />
          </div>

          {error && <p className="job-form-page__error">{error}</p>}

          <div className="job-form-page__actions">
            <button type="submit" className="job-form-page__submit" disabled={loading}>
              {loading ? 'Zapisywanie...' : isEdit ? 'Zapisz zmiany' : 'Dodaj ofertę'}
            </button>

            {isEdit && (
              <button
                type="button"
                onClick={handleDeactivate}
                className="job-form-page__deactivate"
                disabled={loading}
              >
                Dezaktywuj ofertę
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
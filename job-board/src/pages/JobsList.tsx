import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import type { JobPosting } from '../types';

export function JobsList() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ location: '' });
  const [sort, setSort] = useState<'salary_asc' | 'salary_desc'>('salary_asc');
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    fetchJobs();
    fetchLocations();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    let query = supabase
      .from('job_postings')
      .select('*')
      .eq('is_active', true)
      .order('posted_at', { ascending: false });

    if (filter.location) {
      query = query.eq('location', filter.location);
    }

    const { data } = await query;
    
    if (data) {
      let sortedData = [...data];
      if (sort === 'salary_asc') {
        sortedData.sort((a, b) => a.salary_min - b.salary_min);
      } else {
        sortedData.sort((a, b) => b.salary_max - a.salary_max);
      }
      setJobs(sortedData);
    }
    setLoading(false);
  };

  const fetchLocations = async () => {
    const { data } = await supabase
      .from('job_postings')
      .select('location')
      .eq('is_active', true);
    
    if (data) {
      const unique = [...new Set(data.map(j => j.location))];
      setLocations(unique);
    }
  };

  const formatSalary = (min: number, max: number) => {
    return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
  };

  if (loading) return <div className="loading">Ładowanie ofert...</div>;

  return (
    <div className="jobs-page">
      <div className="jobs-page__header">
        <h1 className="jobs-page__title">Oferty pracy</h1>
        
        <div className="jobs-page__filters">
          <div className="jobs-page__filter-group">
            <label className="jobs-page__filter-label">Lokalizacja:</label>
            <select
              value={filter.location}
              onChange={(e) => setFilter(prev => ({ ...prev, location: e.target.value }))}
              className="jobs-page__filter-select"
            >
              <option value="">Wszystkie</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="jobs-page__filter-group">
            <label className="jobs-page__filter-label">Sortuj po:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'salary_asc' | 'salary_desc')}
              className="jobs-page__filter-select"
            >
              <option value="salary_asc">Pensja rosnąco</option>
              <option value="salary_desc">Pensja malejąco</option>
            </select>
          </div>

          <button onClick={fetchJobs} className="jobs-page__filter-btn">
            Filtruj
          </button>
        </div>
      </div>

      <div className="jobs-page__list">
        {jobs.length === 0 ? (
          <p className="jobs-page__empty">Brak ofert spełniających kryteria.</p>
        ) : (
          jobs.map(job => (
            <Link to={`/jobs/${job.id}`} key={job.id} className="jobs-page__item">
              <div className="jobs-page__item-header">
                <h2 className="jobs-page__item-title">{job.position}</h2>
                <span className="jobs-page__item-company">{job.company}</span>
              </div>
              <div className="jobs-page__item-details">
                <span className="jobs-page__item-location">📍 {job.location}</span>
                <span className="jobs-page__item-salary">
                  💰 {formatSalary(job.salary_min, job.salary_max)}
                </span>
                <span className="jobs-page__item-date">
                  📅 {new Date(job.posted_at).toLocaleDateString('pl-PL')}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
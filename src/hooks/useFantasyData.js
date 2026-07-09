import { useState, useEffect } from 'react';

export function useFantasyData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('./data/dsa_questions.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const totalProblems = data
    ? data.patterns.reduce((sum, p) => sum + p.problems.length, 0)
    : 0;

  return { data, loading, error, totalProblems };
}

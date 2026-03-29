import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async ({ email, password }) => {
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed';
      setError('root', { message: msg });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.logo}>THE BESPOKE ATELIER</span>
          <h1 className={styles.title}>Staff Login</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              {...register('email')}
            />
            {errors.email && <span className="error-msg">{errors.email.message}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && <span className="error-msg">{errors.password.message}</span>}
          </div>

          {errors.root && (
            <p className="error-msg" style={{ marginTop: 'var(--sp-2)' }}>{errors.root.message}</p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'var(--sp-6)' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

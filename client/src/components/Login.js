//This program renders the login UI and handles email/password authentication with role-based redirects.

import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import Alert from './ui/Alert';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('[Login] submitting', { email, pwLen: password ? String(password).length : 0 });
      const res = await api.post('/api/auth/login', { email, password });
      console.log('[Login] response', res.status);
      localStorage.setItem('token', res.data.token);
      //Query role from backend to avoid client-side decoding dependency.
      const me = await api.get('/api/auth/me');
      const role = me?.data?.role;
      if (role === 'administrator') {
        navigate('/admin-dashboard');
      } else if (role === 'professor') {
        navigate('/professor');
      } else {
        navigate('/student');
      }
    } catch (error) {
      console.error('[Login] error', error?.response?.status, error?.response?.data || error?.message);
      setError(error.response?.data?.message || 'Error logging in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/*Logo and Brand.*/}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full">
              <QrCodeIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
            Attenova
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            QR-based Attendance Management System
          </p>
        </div>

        {/*Login Form.*/}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign in to your account</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="error" className="mb-6">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={!email || !password}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <footer className="bg-black text-white text-center text-sm py-4 px-4 mt-8">
        <p className="m-0">Attenova • Created by Mridankan Mandal</p>
      </footer>
    </div>
  );
};

export default Login;

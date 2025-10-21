import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import Alert from './ui/Alert';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'student',
    year: '',
    section: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.role === 'student' && (!formData.year || !formData.section)) {
      setError('Year and section are required for students');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role
      };

      if (formData.role === 'student') {
        submitData.year = formData.year;
        submitData.section = formData.section;
      }

      await api.post('/api/auth/signup', submitData);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || 'Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Brand */}
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
            Create your account to get started
          </p>
        </div>

        {/* Sign Up Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Create your account</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="error" className="mb-6">
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success" className="mb-6">
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                autoComplete="name"
              />

              <Input
                label="Email address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  helperText="Must be at least 6 characters long"
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

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              <Select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="student">Student</option>
                <option value="professor">Professor</option>
              </Select>

              {formData.role === 'student' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                    placeholder="Select year"
                  >
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                  </Select>

                  <Select
                    label="Section"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    required
                    placeholder="Select section"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </Select>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={!formData.email || !formData.password || !formData.name}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;

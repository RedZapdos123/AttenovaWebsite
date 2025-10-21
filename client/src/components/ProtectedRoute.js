// This program provides role-based route guarding, redirecting unauthorized users appropriately.

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';

const roleRedirect = (role) => {
  if (role === 'administrator') return '/admin-dashboard';
  if (role === 'professor') return '/professor';
  if (role === 'student') return '/student';
  return '/login';
};

const ProtectedRoute = ({ allow = [], element }) => {
  const [state, setState] = useState({ loading: true, role: null, authed: false });

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await api.get('/api/auth/me');
        if (!mounted) return;
        const role = res?.data?.role;
        setState({ loading: false, role, authed: true });
      } catch (e) {
        setState({ loading: false, role: null, authed: false });
      }
    };
    check();
    return () => { mounted = false; };
  }, []);

  if (state.loading) return (<div className="p-6 text-center text-gray-600">Checking access…</div>);
  if (!state.authed) return <Navigate to="/login" replace />;
  if (allow.length > 0 && !allow.includes(state.role)) {
    return <Navigate to={roleRedirect(state.role)} replace />;
  }
  return element;
};

export default ProtectedRoute;


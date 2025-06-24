import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import RegistrationForm from '../components/RegistrationForm';
import { useAuth } from '../contexts/AuthContext';
const Register = () => {
  const {
    role
  } = useParams<{
    role: string;
  }>();
  const {
    user
  } = useAuth();
  if (user) {
    return <Navigate to={`/${user.role}`} />;
  }
  // Validate role
  const validRoles = ['user', 'supervisor', 'technical-manager', 'engineer', 'customer-officer'];
  if (!role || !validRoles.includes(role)) {
    return <Navigate to="/" />;
  }
  return <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Register for Tire Management System
        </h1>
        <p className="text-gray-600">
          Create your account to access the system
        </p>
      </div>
      <RegistrationForm role={role as any} />
    </div>;
};
export default Register;
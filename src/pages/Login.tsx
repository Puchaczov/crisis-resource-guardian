
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import { AlertTriangle } from 'lucide-react';

const Login = () => {
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4">
      <div className="flex items-center mb-8">
        <AlertTriangle className="h-10 w-10 text-warning mr-3" />
        <div>
          <h1 className="text-3xl font-bold text-navy">
            Kryzysowe Monitorowanie Zasobów
          </h1>
          <p className="text-muted-foreground">
            System zarządzania i alokacji zasobów kryzysowych
          </p>
        </div>
      </div>

      <LoginForm />
      
      <div className="mt-8 text-center text-sm text-muted-foreground max-w-md">
        <p>
          System monitorowania zasobów do zarządzania kryzysowego.
          Zapewnia bieżący, wiarygodny obraz "co, gdzie i w jakiej ilości" znajduje się na danym terenie.
        </p>
      </div>
    </div>
  );
};

export default Login;

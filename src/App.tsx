import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RequesterPage } from './pages/RequesterPage';
import { TechnicianPage } from './pages/TechnicianPage';
import { AdminPage } from './pages/AdminPage';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (user.role === 'admin') {
    return <AdminPage />;
  }

  if (user.role === 'technician') {
    return <TechnicianPage />;
  }

  return <RequesterPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

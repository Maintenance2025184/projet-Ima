import { useState, useEffect } from 'react';
import { supabase, User as DBUser } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Users, Shield, Edit2, Trash2, Plus, X } from 'lucide-react';
import { Dashboard } from '../components/Dashboard';
import { InterventionList } from '../components/InterventionList';
import { EquipmentManagement } from '../components/EquipmentManagement';
import { LocationManagement } from '../components/LocationManagement';

type View = 'dashboard' | 'interventions' | 'users' | 'equipment' | 'locations';

export function AdminPage() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedIntervention, setSelectedIntervention] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    email: '',
    full_name: '',
    role: 'requester',
  });

  useEffect(() => {
    if (currentView === 'users') {
      loadUsers();
    }
  }, [currentView, refreshTrigger]);

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setUsers(data);
    setLoading(false);
  };

  const handleEditUser = (user: DBUser) => {
    setEditingUserId(user.id);
    setUserForm({
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    });
    setShowUserForm(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      await supabase.from('users').delete().eq('id', userId);
      loadUsers();
    }
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUserId) {
      await supabase
        .from('users')
        .update({
          full_name: userForm.full_name,
          role: userForm.role,
        })
        .eq('id', editingUserId);
    }

    setShowUserForm(false);
    setEditingUserId(null);
    setUserForm({ email: '', full_name: '', role: 'requester' });
    loadUsers();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'technician':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const formatRole = (role: string) => {
    const roles: Record<string, string> = {
      admin: 'Administrateur',
      technician: 'Technicien',
      requester: 'Demandeur',
    };
    return roles[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
                <p className="text-sm text-gray-600">Connecté en tant que: {user?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-56">
            <div className="bg-white rounded-lg shadow-md p-4 space-y-2 sticky top-24">
              {[
                { view: 'dashboard', label: 'Tableau de Bord', icon: Shield },
                { view: 'interventions', label: 'Interventions', icon: Users },
                { view: 'users', label: 'Utilisateurs', icon: Users },
                { view: 'equipment', label: 'Équipements', icon: Shield },
                { view: 'locations', label: 'Lieux', icon: Shield },
              ].map(({ view, label, icon: Icon }) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view as View)}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${
                    currentView === view
                      ? 'bg-red-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </aside>

          <main className="flex-1">
            {currentView === 'dashboard' && <Dashboard />}

            {currentView === 'interventions' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Toutes les Interventions</h2>
                <InterventionList
                  onSelectIntervention={setSelectedIntervention}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            )}

            {currentView === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                  </div>
                ) : (
                  <>
                    {showUserForm && (
                      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-500">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Modifier l'utilisateur
                          </h3>
                          <button
                            onClick={() => {
                              setShowUserForm(false);
                              setEditingUserId(null);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <form onSubmit={handleSubmitUser} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email
                            </label>
                            <input
                              type="email"
                              value={userForm.email}
                              disabled
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nom complet
                            </label>
                            <input
                              type="text"
                              required
                              value={userForm.full_name}
                              onChange={(e) =>
                                setUserForm({ ...userForm, full_name: e.target.value })
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Rôle
                            </label>
                            <select
                              required
                              value={userForm.role}
                              onChange={(e) =>
                                setUserForm({ ...userForm, role: e.target.value })
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                              <option value="requester">Demandeur</option>
                              <option value="technician">Technicien</option>
                              <option value="admin">Administrateur</option>
                            </select>
                          </div>
                          <div className="flex justify-end space-x-4">
                            <button
                              type="button"
                              onClick={() => {
                                setShowUserForm(false);
                                setEditingUserId(null);
                              }}
                              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Annuler
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Modifier
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Email
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Nom
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Rôle
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Date création
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr
                              key={user.id}
                              className="border-t border-gray-100 hover:bg-gray-50"
                            >
                              <td className="py-3 px-4 text-sm text-gray-900">{user.email}</td>
                              <td className="py-3 px-4 text-sm text-gray-900">
                                {user.full_name}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(
                                    user.role
                                  )}`}
                                >
                                  {formatRole(user.role)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {new Date(user.created_at).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditUser(user)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {users.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          Aucun utilisateur
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {currentView === 'equipment' && <EquipmentManagement />}
            {currentView === 'locations' && <LocationManagement />}
          </main>
        </div>
      </div>
    </div>
  );
}

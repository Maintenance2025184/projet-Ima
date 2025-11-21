import { useState, useEffect } from 'react';
import { supabase, Intervention } from '../lib/supabase';
import { ArrowLeft, Users, Settings, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { InterventionDetails } from '../components/InterventionDetails';
import { EquipmentManagement } from '../components/EquipmentManagement';
import { LocationManagement } from '../components/LocationManagement';

type View = 'dashboard' | 'interventions' | 'equipment' | 'locations';

type TechnicianPageProps = {
  onChangeRole: () => void;
};

export function TechnicianPage({ onChangeRole }: TechnicianPageProps) {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    completionRate: 0,
  });

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('interventions')
      .select('*')
      .order('priority', { ascending: false })
      .order('requested_date', { ascending: false });

    if (data) {
      setInterventions(data);

      const total = data.length;
      const pending = data.filter((i) => i.status === 'pending').length;
      const inProgress = data.filter((i) => i.status === 'in_progress').length;
      const completed = data.filter((i) => i.status === 'completed').length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      setStats({ total, pending, inProgress, completed, completionRate });
    }
    setLoading(false);
  };

  const handleAssignToMe = async (interventionId: string) => {
    const technicianId = Math.random().toString(36).substr(2, 9);
    await supabase
      .from('interventions')
      .update({ technician_id: technicianId, status: 'assigned' })
      .eq('id', interventionId);

    setRefreshTrigger((prev) => prev + 1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-green-500 bg-green-50';
    }
  };

  const formatStatus = (status: string) => {
    const statuses: Record<string, string> = {
      pending: 'En attente',
      assigned: 'Assignée',
      in_progress: 'En cours',
      completed: 'Terminée',
      cancelled: 'Annulée',
    };
    return statuses[status] || status;
  };

  const formatPriority = (priority: string) => {
    const priorities: Record<string, string> = {
      low: 'Basse',
      medium: 'Moyenne',
      high: 'Haute',
      urgent: 'Urgente',
    };
    return priorities[priority] || priority;
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: typeof Users;
    label: string;
    value: string | number;
    color: string;
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: color + '20' }}>
          <Icon className="w-8 h-8" style={{ color }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Équipe de Maintenance</h1>
            <button
              onClick={onChangeRole}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Changer de rôle</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-56">
            <div className="bg-white rounded-lg shadow-md p-4 space-y-2 sticky top-24">
              {[
                { view: 'dashboard', label: 'Tableau de Bord', icon: TrendingUp },
                { view: 'interventions', label: 'Interventions', icon: Clock },
                { view: 'equipment', label: 'Équipements', icon: AlertTriangle },
                { view: 'locations', label: 'Lieux', icon: Settings },
              ].map(({ view, label, icon: Icon }) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view as View)}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${
                    currentView === view
                      ? 'bg-blue-600 text-white'
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
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : currentView === 'dashboard' ? (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">Tableau de Bord Équipe</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <StatCard
                    icon={Users}
                    label="Total Interventions"
                    value={stats.total}
                    color="#3B82F6"
                  />
                  <StatCard
                    icon={AlertTriangle}
                    label="En Attente"
                    value={stats.pending}
                    color="#F59E0B"
                  />
                  <StatCard
                    icon={Clock}
                    label="En Cours"
                    value={stats.inProgress}
                    color="#8B5CF6"
                  />
                  <StatCard
                    icon={CheckCircle}
                    label="Terminées"
                    value={stats.completed}
                    color="#10B981"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Taux Complétion"
                    value={`${stats.completionRate}%`}
                    color="#06B6D4"
                  />
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Interventions Prioritaires</h3>

                  <div className="space-y-3">
                    {interventions
                      .filter((i) => i.priority === 'urgent' || i.priority === 'high')
                      .slice(0, 5)
                      .map((intervention) => (
                        <div
                          key={intervention.id}
                          className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${getPriorityColor(
                            intervention.priority
                          )} cursor-pointer hover:shadow-md transition-shadow`}
                          onClick={() => setSelectedIntervention(intervention)}
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{intervention.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {formatStatus(intervention.status)}
                            </p>
                          </div>
                          {!intervention.technician_id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignToMe(intervention.id);
                              }}
                              className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              M'assigner
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : currentView === 'interventions' ? (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">Toutes les Interventions</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {interventions.map((intervention) => (
                    <div
                      key={intervention.id}
                      className={`bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition-all cursor-pointer ${getPriorityColor(
                        intervention.priority
                      )}`}
                      onClick={() => setSelectedIntervention(intervention)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {intervention.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {intervention.description || 'Pas de description'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-current">
                          {formatPriority(intervention.priority)}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            intervention.status
                          )}`}
                        >
                          {formatStatus(intervention.status)}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progression</span>
                          <span className="font-medium text-gray-900">
                            {intervention.progress_percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${intervention.progress_percentage}%` }}
                          />
                        </div>
                      </div>

                      {!intervention.technician_id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignToMe(intervention.id);
                          }}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          M'assigner cette intervention
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {interventions.length === 0 && (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Aucune intervention</p>
                  </div>
                )}
              </div>
            ) : currentView === 'equipment' ? (
              <EquipmentManagement />
            ) : (
              <LocationManagement />
            )}
          </main>
        </div>
      </div>

      {selectedIntervention && (
        <InterventionDetails
          intervention={selectedIntervention}
          onClose={() => setSelectedIntervention(null)}
          onUpdate={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}
    </div>
  );
}

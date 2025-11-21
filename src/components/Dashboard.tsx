import { useEffect, useState } from 'react';
import { Activity, Clock, CheckCircle, AlertTriangle, TrendingUp, Wrench } from 'lucide-react';
import { supabase, Intervention } from '../lib/supabase';

type Stats = {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  urgent: number;
  avgDuration: number;
};

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    urgent: 0,
    avgDuration: 0,
  });
  const [recentInterventions, setRecentInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const { data: interventions } = await supabase
      .from('interventions')
      .select('*')
      .order('created_at', { ascending: false });

    if (interventions) {
      const total = interventions.length;
      const pending = interventions.filter(i => i.status === 'pending').length;
      const inProgress = interventions.filter(i => i.status === 'in_progress').length;
      const completed = interventions.filter(i => i.status === 'completed').length;
      const urgent = interventions.filter(i => i.priority === 'urgent').length;

      const completedInterventions = interventions.filter(i => i.status === 'completed' && i.actual_duration > 0);
      const avgDuration = completedInterventions.length > 0
        ? Math.round(completedInterventions.reduce((sum, i) => sum + i.actual_duration, 0) / completedInterventions.length)
        : 0;

      setStats({ total, pending, inProgress, completed, urgent, avgDuration });
      setRecentInterventions(interventions.slice(0, 5));
    }
    setLoading(false);
  };

  const StatCard = ({ icon: Icon, label, value, color }: { icon: typeof Activity, label: string, value: string | number, color: string }) => (
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'assigned': return 'text-purple-600 bg-purple-50';
      case 'pending': return 'text-gray-600 bg-gray-50';
      default: return 'text-red-600 bg-red-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={Activity} label="Total Interventions" value={stats.total} color="#3B82F6" />
        <StatCard icon={Clock} label="En Attente" value={stats.pending} color="#F59E0B" />
        <StatCard icon={Wrench} label="En Cours" value={stats.inProgress} color="#8B5CF6" />
        <StatCard icon={CheckCircle} label="Terminées" value={stats.completed} color="#10B981" />
        <StatCard icon={AlertTriangle} label="Urgentes" value={stats.urgent} color="#EF4444" />
        <StatCard icon={TrendingUp} label="Durée Moyenne" value={`${stats.avgDuration}min`} color="#06B6D4" />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Interventions Récentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Titre</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Priorité</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Progression</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentInterventions.map((intervention) => (
                <tr key={intervention.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{intervention.title}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(intervention.priority)}`}>
                      {intervention.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(intervention.status)}`}>
                      {intervention.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${intervention.progress_percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{intervention.progress_percentage}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(intervention.requested_date).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentInterventions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucune intervention enregistrée
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

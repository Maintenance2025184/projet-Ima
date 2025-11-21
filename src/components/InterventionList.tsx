import { useEffect, useState } from 'react';
import { supabase, Intervention } from '../lib/supabase';
import { Search, Filter, Eye } from 'lucide-react';

type InterventionListProps = {
  onSelectIntervention: (intervention: Intervention) => void;
  refreshTrigger: number;
};

export function InterventionList({ onSelectIntervention, refreshTrigger }: InterventionListProps) {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [filteredInterventions, setFilteredInterventions] = useState<Intervention[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterventions();
  }, [refreshTrigger]);

  useEffect(() => {
    filterInterventions();
  }, [interventions, searchTerm, statusFilter, priorityFilter]);

  const loadInterventions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('interventions')
      .select('*')
      .order('requested_date', { ascending: false });

    if (data) {
      setInterventions(data);
    }
    setLoading(false);
  };

  const filterInterventions = () => {
    let filtered = [...interventions];

    if (searchTerm) {
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((i) => i.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((i) => i.priority === priorityFilter);
    }

    setFilteredInterventions(filtered);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100';
      case 'in_progress': return 'text-blue-700 bg-blue-100';
      case 'assigned': return 'text-purple-700 bg-purple-100';
      case 'pending': return 'text-gray-700 bg-gray-100';
      default: return 'text-red-700 bg-red-100';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une intervention..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="assigned">Assignée</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Toutes priorités</option>
              <option value="urgent">Urgente</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          {filteredInterventions.length} intervention{filteredInterventions.length !== 1 ? 's' : ''} trouvée{filteredInterventions.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredInterventions.map((intervention) => (
          <div
            key={intervention.id}
            className={`bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow cursor-pointer ${
              intervention.priority === 'urgent' ? 'border-red-500' :
              intervention.priority === 'high' ? 'border-orange-500' :
              intervention.priority === 'medium' ? 'border-yellow-500' :
              'border-green-500'
            }`}
            onClick={() => onSelectIntervention(intervention)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex-1">{intervention.title}</h3>
              <button className="text-blue-600 hover:text-blue-800 ml-2">
                <Eye className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {intervention.description || 'Aucune description'}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(intervention.priority)}`}>
                {formatPriority(intervention.priority)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(intervention.status)}`}>
                {formatStatus(intervention.status)}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progression</span>
                <span className="font-medium text-gray-900">{intervention.progress_percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${intervention.progress_percentage}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-500">
              <span>Créée le {new Date(intervention.requested_date).toLocaleDateString('fr-FR')}</span>
              {intervention.scheduled_date && (
                <span>Prévue le {new Date(intervention.scheduled_date).toLocaleDateString('fr-FR')}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredInterventions.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">Aucune intervention trouvée</p>
        </div>
      )}
    </div>
  );
}

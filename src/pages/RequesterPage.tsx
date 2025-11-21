import { useState, useEffect } from 'react';
import { supabase, Intervention } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, LogOut, Eye, Trash2, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { InterventionForm } from '../components/InterventionForm';
import { InterventionDetails } from '../components/InterventionDetails';

export function RequesterPage() {
  const { user, signOut } = useAuth();
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadInterventions();
  }, [refreshTrigger]);

  const loadInterventions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('interventions')
      .select('*')
      .eq('requester_id', user?.id)
      .order('requested_date', { ascending: false });

    if (data) setInterventions(data);
    setLoading(false);
  };

  const handleDeleteIntervention = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) {
      await supabase.from('interventions').delete().eq('id', id);
      loadInterventions();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes Demandes de Maintenance</h1>
              <p className="text-sm text-gray-600">Connecté en tant que: {user?.email}</p>
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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Tableau de Bord Demandeur</h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle Demande</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {interventions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">Aucune demande d'intervention</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Créer votre première demande
                </button>
              </div>
            ) : (
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
                      <div className="flex space-x-2 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIntervention(intervention);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteIntervention(intervention.id);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
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

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center">
                          {getStatusIcon(intervention.status)}
                          <span className="ml-2">Progression</span>
                        </span>
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

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          Créée le{' '}
                          {new Date(intervention.requested_date).toLocaleDateString('fr-FR')}
                        </span>
                        {intervention.scheduled_date && (
                          <span>
                            Prévue le{' '}
                            {new Date(intervention.scheduled_date).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <InterventionForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      )}

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

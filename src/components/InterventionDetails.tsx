import { useEffect, useState } from 'react';
import { supabase, Intervention, InterventionUpdate } from '../lib/supabase';
import { X, Clock, User, MapPin, Wrench, Calendar, TrendingUp, MessageSquare } from 'lucide-react';

type InterventionDetailsProps = {
  intervention: Intervention;
  onClose: () => void;
  onUpdate: () => void;
};

export function InterventionDetails({ intervention, onClose, onUpdate }: InterventionDetailsProps) {
  const [updates, setUpdates] = useState<InterventionUpdate[]>([]);
  const [newUpdate, setNewUpdate] = useState({
    status: intervention.status,
    progress_percentage: intervention.progress_percentage,
    comment: '',
    time_spent: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUpdates();
  }, [intervention.id]);

  const loadUpdates = async () => {
    const { data } = await supabase
      .from('intervention_updates')
      .select('*')
      .eq('intervention_id', intervention.id)
      .order('created_at', { ascending: false });

    if (data) {
      setUpdates(data);
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updateData = {
      intervention_id: intervention.id,
      status: newUpdate.status,
      progress_percentage: parseInt(newUpdate.progress_percentage.toString()),
      comment: newUpdate.comment,
      time_spent: newUpdate.time_spent ? parseInt(newUpdate.time_spent) : 0,
    };

    const { error: updateError } = await supabase
      .from('intervention_updates')
      .insert([updateData]);

    if (!updateError) {
      const interventionUpdates: any = {
        status: newUpdate.status,
        progress_percentage: parseInt(newUpdate.progress_percentage.toString()),
      };

      if (newUpdate.status === 'in_progress' && !intervention.started_at) {
        interventionUpdates.started_at = new Date().toISOString();
      }

      if (newUpdate.status === 'completed') {
        interventionUpdates.completed_at = new Date().toISOString();
        interventionUpdates.progress_percentage = 100;
      }

      if (newUpdate.time_spent) {
        interventionUpdates.actual_duration = intervention.actual_duration + parseInt(newUpdate.time_spent);
      }

      await supabase
        .from('interventions')
        .update(interventionUpdates)
        .eq('id', intervention.id);

      setNewUpdate({
        status: newUpdate.status,
        progress_percentage: newUpdate.status === 'completed' ? 100 : parseInt(newUpdate.progress_percentage.toString()),
        comment: '',
        time_spent: '',
      });

      loadUpdates();
      onUpdate();
    }

    setLoading(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Détails de l'intervention</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{intervention.title}</h3>
            <p className="text-gray-600">{intervention.description || 'Aucune description'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Statut</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(intervention.status)}`}>
                  {formatStatus(intervention.status)}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Priorité</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(intervention.priority)}`}>
                  {formatPriority(intervention.priority)}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Temps estimé / réel</p>
                <p className="font-medium text-gray-900">
                  {intervention.estimated_duration}min / {intervention.actual_duration}min
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Date de demande</p>
                <p className="font-medium text-gray-900">
                  {new Date(intervention.requested_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progression</span>
              <span className="text-lg font-bold text-blue-600">{intervention.progress_percentage}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${intervention.progress_percentage}%` }}
              />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Mise à jour de l'intervention</h4>
            <form onSubmit={handleSubmitUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={newUpdate.status}
                    onChange={(e) => setNewUpdate({ ...newUpdate, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">En attente</option>
                    <option value="assigned">Assignée</option>
                    <option value="in_progress">En cours</option>
                    <option value="completed">Terminée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Progression (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newUpdate.progress_percentage}
                    onChange={(e) => setNewUpdate({ ...newUpdate, progress_percentage: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temps passé (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newUpdate.time_spent}
                    onChange={(e) => setNewUpdate({ ...newUpdate, time_spent: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire
                </label>
                <textarea
                  value={newUpdate.comment}
                  onChange={(e) => setNewUpdate({ ...newUpdate, comment: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Décrivez l'avancement ou les actions effectuées..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer la mise à jour'}
              </button>
            </form>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Historique des mises à jour
            </h4>
            <div className="space-y-4">
              {updates.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune mise à jour pour le moment</p>
              ) : (
                updates.map((update) => (
                  <div key={update.id} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {update.status && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(update.status)}`}>
                            {formatStatus(update.status)}
                          </span>
                        )}
                        {update.progress_percentage !== null && (
                          <span className="text-sm font-medium text-blue-600">
                            {update.progress_percentage}%
                          </span>
                        )}
                        {update.time_spent > 0 && (
                          <span className="text-sm text-gray-600">
                            +{update.time_spent}min
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(update.created_at).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    {update.comment && (
                      <p className="text-sm text-gray-700 mt-2">{update.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { supabase, Equipment, Location } from '../lib/supabase';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export function EquipmentManagement() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    type: 'machine',
    status: 'operational',
    location_id: '',
    installation_date: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [equipmentData, locationsData] = await Promise.all([
      supabase.from('equipment').select('*').order('name'),
      supabase.from('locations').select('*').order('name'),
    ]);

    if (equipmentData.data) setEquipment(equipmentData.data);
    if (locationsData.data) setLocations(locationsData.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name: formData.name,
      reference: formData.reference,
      type: formData.type,
      status: formData.status,
      location_id: formData.location_id || null,
      installation_date: formData.installation_date || null,
    };

    if (editingId) {
      await supabase.from('equipment').update(data).eq('id', editingId);
    } else {
      await supabase.from('equipment').insert([data]);
    }

    resetForm();
    loadData();
  };

  const handleEdit = (item: Equipment) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      reference: item.reference,
      type: item.type,
      status: item.status,
      location_id: item.location_id || '',
      installation_date: item.installation_date || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
      await supabase.from('equipment').delete().eq('id', id);
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      reference: '',
      type: 'machine',
      status: 'operational',
      location_id: '',
      installation_date: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'under_maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_service': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    const statuses: Record<string, string> = {
      operational: 'Opérationnel',
      under_maintenance: 'En maintenance',
      out_of_service: 'Hors service',
    };
    return statuses[status] || status;
  };

  const formatType = (type: string) => {
    const types: Record<string, string> = {
      machine: 'Machine',
      hvac: 'CVC',
      electrical: 'Électrique',
      plumbing: 'Plomberie',
      other: 'Autre',
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Équipements</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvel équipement</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Modifier l\'équipement' : 'Nouvel équipement'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Référence</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="machine">Machine</option>
                  <option value="hvac">CVC</option>
                  <option value="electrical">Électrique</option>
                  <option value="plumbing">Plomberie</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="operational">Opérationnel</option>
                  <option value="under_maintenance">En maintenance</option>
                  <option value="out_of_service">Hors service</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lieu</label>
                <select
                  value={formData.location_id}
                  onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un lieu</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date d'installation</label>
                <input
                  type="date"
                  value={formData.installation_date}
                  onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingId ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nom</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Référence</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((item) => (
              <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-900">{item.name}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{item.reference || '-'}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{formatType(item.type)}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {formatStatus(item.status)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
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
        {equipment.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun équipement enregistré
          </div>
        )}
      </div>
    </div>
  );
}

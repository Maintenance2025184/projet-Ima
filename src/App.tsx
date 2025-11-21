import { useState } from 'react';
import { Wrench, Users, Hammer } from 'lucide-react';
import { RequesterPage } from './pages/RequesterPage';
import { TechnicianPage } from './pages/TechnicianPage';

type Role = 'requester' | 'technician' | null;

function App() {
  const [role, setRole] = useState<Role>(null);

  if (role === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Wrench className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Plateforme de Gestion de Maintenance
            </h1>
            <p className="text-lg text-gray-600">
              Choisissez votre rôle pour accéder à l'application
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button
              onClick={() => setRole('requester')}
              className="group bg-white rounded-lg shadow-lg p-8 hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <div className="mb-4">
                <Users className="w-16 h-16 text-green-600 mx-auto group-hover:scale-110 transition-transform" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Demandeur</h2>
              <p className="text-gray-600 mb-4">
                Créez et suivez vos demandes d'intervention
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Soumettre des demandes</li>
                <li>✓ Suivre la progression</li>
                <li>✓ Consulter l'historique</li>
              </ul>
            </button>

            <button
              onClick={() => setRole('technician')}
              className="group bg-white rounded-lg shadow-lg p-8 hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <div className="mb-4">
                <Hammer className="w-16 h-16 text-blue-600 mx-auto group-hover:scale-110 transition-transform" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Équipe Maintenance</h2>
              <p className="text-gray-600 mb-4">
                Gérez les interventions et les ressources
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Voir toutes les demandes</li>
                <li>✓ S'assigner des tâches</li>
                <li>✓ Gérer équipements & lieux</li>
              </ul>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (role === 'requester') {
    return (
      <RequesterPage
        onChangeRole={() => setRole(null)}
      />
    );
  }

  return (
    <TechnicianPage
      onChangeRole={() => setRole(null)}
    />
  );
}

export default App;

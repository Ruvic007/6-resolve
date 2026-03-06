import { useState, useEffect } from "react";

const DEMO_DATA = {
  metrics: { coutTotal: 787, consommationTotale: 956, impactCarbone: 11, energieRenouvelable: 0 },
  consommationParUsages: { labels: ["Chauffage", "Éclairage", "Climatisation"], data: { chauffage: 650, eclairage: 250, climatisation: 56 } },
  repartitionCouts: { electricite: 70, gaz: 30 },
  detailsBatiment: [
    { label: "Nom du bâtiment", value: "" }, { label: "Surface", value: "22 m²" },
    { label: "Surface du toit", value: "70 m²" }, { label: "Zone géographique", value: "" },
  ],
  actionsPrioritaires: [
    { id: 1, titre: "Isolation des combles", statut: "Complet", couleur: "green", icon: "lightbulb" },
    { id: 2, titre: "Isolation des murs", statut: "En cours", couleur: "orange", icon: "lightbulb" },
    { id: 3, titre: "Changement du chauffage", statut: "Planifié", couleur: "red", icon: "star" },
    { id: 4, titre: "Installation de panneaux PV", statut: "Terminé", couleur: "green", icon: "sun" },
  ],
};

// getToken est la fonction Clerk (issue de useAuth()) qui génère un JWT frais.
// On la reçoit en paramètre plutôt que userId pour ne jamais exposer l'ID utilisateur en clair.
export function useDashboardData(companyId, getToken) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCompanyId, setCurrentCompanyId] = useState(companyId);

  useEffect(() => {
    const fetchData = async () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

      // Si getToken n'est pas encore disponible (Clerk pas encore chargé), on attend.
      if (!getToken) return;

      try {
        setLoading(true);
        let targetCompanyId = companyId;

        // On récupère le token JWT une seule fois pour toutes les requêtes de ce cycle.
        // getToken() est async car Clerk peut avoir besoin de le rafraîchir.
        const token = await getToken();
        // En-tête réutilisé pour toutes les requêtes authentifiées.
        const authHeader = { "Authorization": `Bearer ${token}` };

        // Si pas de companyId, on cherche le dernier audit de l'utilisateur.
        // Le backend identifie l'utilisateur via le JWT — plus besoin de ?user_id= dans l'URL.
        if (!companyId) {
          const companiesResponse = await fetch(`${baseUrl}/api/companies`, {
            headers: authHeader,
          });
          if (companiesResponse.ok) {
            const companiesResult = await companiesResponse.json();
            if (companiesResult.status === "success" && companiesResult.data?.length > 0) {
              const latestAudit = companiesResult.data[0];
              targetCompanyId = latestAudit.id;
              setCurrentCompanyId(targetCompanyId);
            }
          }
        }

        if (!targetCompanyId) {
          setError("no_audit");
          setLoading(false);
          return;
        }

        // Le token est aussi envoyé ici pour que le backend vérifie que l'utilisateur
        // est bien le propriétaire de cette entreprise (contrôle d'accès horizontal).
        const response = await fetch(`${baseUrl}/api/dashboard/${targetCompanyId}`, {
          headers: authHeader,
        });

        if (!response.ok) throw new Error(`Erreur ${response.status}`);
        const result = await response.json();

        if (result.status === "success" && result.data) {
          setData(result.data);
          setCurrentCompanyId(targetCompanyId);
        } else {
          throw new Error(result.message || "Données invalides");
        }
      } catch (err) {
        console.error("API Fallback:", err);
        setError(err.message);
        setData(DEMO_DATA);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [companyId, getToken]);

  return { data, loading, error, currentCompanyId };
}
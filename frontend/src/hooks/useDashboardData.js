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

export function useDashboardData(companyId, userId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCompanyId, setCurrentCompanyId] = useState(companyId);

  useEffect(() => {
    const fetchData = async () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

      try {
        setLoading(true);
        let targetCompanyId = companyId;

        // Si pas de companyId mais userId, chercher le dernier audit
        if (!companyId && userId) {
          const companiesResponse = await fetch(`${baseUrl}/api/companies?user_id=${userId}`);
          if (companiesResponse.ok) {
            const companiesResult = await companiesResponse.json();
            if (companiesResult.status === "success" && companiesResult.data?.length > 0) {
              // Prendre le dernier audit (le plus récent)
              const latestAudit = companiesResult.data[0];
              targetCompanyId = latestAudit.id;
              setCurrentCompanyId(targetCompanyId);
            }
          }
        }

        // Si toujours pas de companyId, aucun audit trouvé
        if (!targetCompanyId) {
          setError("no_audit");
          setLoading(false);
          return;
        }

        // Charger les données du dashboard
        const response = await fetch(`${baseUrl}/api/dashboard/${targetCompanyId}`);

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
  }, [companyId, userId]);

  return { data, loading, error, currentCompanyId };
}
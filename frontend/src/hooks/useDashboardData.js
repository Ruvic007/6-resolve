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
    { id: 1, titre: "Isolation des combles", statut: "Complet", couleur: "green", icon: "💡" },
    { id: 2, titre: "Isolation des murs", statut: "En cours", couleur: "orange", icon: "💡" },
    { id: 3, titre: "Changement du chauffage", statut: "Planifié", couleur: "red", icon: "⭐" },
    { id: 4, titre: "Installation de panneaux PV", statut: "Terminé", couleur: "green", icon: "⭐" },
  ],
};

export function useDashboardData(companyId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        const response = await fetch(`${baseUrl}/api/dashboard/${companyId || "latest"}`);
        
        if (!response.ok) throw new Error(`Erreur ${response.status}`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("API Fallback:", err);
        setError(err.message);
        setData(DEMO_DATA); // Fallback sur démo en cas d'erreur
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [companyId]);

  return { data, loading, error };
}
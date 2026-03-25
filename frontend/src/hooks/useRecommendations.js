import { useState, useEffect } from "react";

export function useRecommendations(getToken) {
  const [recommendations, setRecommendations] = useState([]);
  const [companyName, setCompanyName] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      if (!getToken) return;

      try {
        setLoading(true);
        const token = await getToken();
        const authHeader = { Authorization: `Bearer ${token}` };

        // 1. Récupérer le dernier audit de l'utilisateur
        const companiesRes = await fetch(`${baseUrl}/api/companies`, { headers: authHeader });
        if (!companiesRes.ok) throw new Error("Impossible de récupérer vos audits");

        const companiesData = await companiesRes.json();
        if (companiesData.status !== "success" || !companiesData.data?.length) {
          setError("no_audit");
          return;
        }

        const latestId = companiesData.data[0].id;
        setCompanyId(latestId);

        // 2. Récupérer les recommandations personnalisées
        const recoRes = await fetch(`${baseUrl}/api/recommendations/${latestId}`, {
          headers: authHeader,
        });
        if (!recoRes.ok) throw new Error(`Erreur ${recoRes.status}`);

        const recoData = await recoRes.json();
        if (recoData.status === "success") {
          setRecommendations(recoData.data);
          setCompanyName(recoData.company_name);
        } else {
          throw new Error(recoData.message || "Erreur inconnue");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getToken]);

  return { recommendations, companyName, companyId, loading, error };
}

import React from 'react';

export const MetricCard = ({ icon, label, value, colorClass }) => (
  <div className="metric-card">
    <div className={`metric-icon ${colorClass}`}>{icon}</div>
    <div className="metric-info">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </div>
  </div>
);

export const ActionItem = ({ action }) => (
  <div className="action-item">
    <span className="action-icon">{action.icon}</span>
    <div className="action-content">
      <div className="action-titre">{action.titre}</div>
      <div className={`action-statut ${action.couleur}`}>{action.statut}</div>
    </div>
    <span className="action-arrow">▼</span>
  </div>
);

export const SidebarIcon = ({ icon, title, active, onClick }) => (
  <div className={`sidebar-icon ${active ? 'active' : ''}`} onClick={onClick} title={title}>
    {icon}
  </div>
);
const TABS = [
  { id: 'all', label: 'All' },
  { id: 'text', label: 'Text' },
  { id: 'images', label: 'Images' },
  { id: 'files', label: 'Files' },
  { id: 'links', label: 'Links' },
];

export default function HistoryTabs({ active, onChange, counts }) {
  return (
    <div className="history-tabs" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={`history-tabs__tab ${active === tab.id ? 'history-tabs__tab--active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {counts[tab.id] > 0 && (
            <span className="history-tabs__count">{counts[tab.id]}</span>
          )}
        </button>
      ))}
    </div>
  );
}

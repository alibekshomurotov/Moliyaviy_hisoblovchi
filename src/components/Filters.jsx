import { useState, useRef } from 'react';

function Filters({ onFilterChange, onExport, onImport }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const handleFilter = (type) => {
    setActiveFilter(type);
    onFilterChange({ type, dateRange });
  };

  const handleDateChange = (field, value) => {
    const newRange = { ...dateRange, [field]: value };
    setDateRange(newRange);
    onFilterChange({ type: activeFilter, dateRange: newRange });
  };

  const fileInputRef = useRef(null);

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          onImport(data);
        } catch (err) {
          alert('Xato: noto\'g\'ri fayl formati');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="filters-section">
      <div className="filter-group">
        <label>📅 Sana bo'yicha:</label>
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => handleDateChange('start', e.target.value)}
        />
        <span>-</span>
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => handleDateChange('end', e.target.value)}
        />
      </div>

      <div className="filter-buttons">
        <button className={activeFilter === 'all' ? 'active' : ''} onClick={() => handleFilter('all')}>
          📋 Hammasi
        </button>
        <button className={activeFilter === 'income' ? 'active' : ''} onClick={() => handleFilter('income')}>
          💰 Kirimlar
        </button>
        <button className={activeFilter === 'expense' ? 'active' : ''} onClick={() => handleFilter('expense')}>
          💸 Chiqimlar
        </button>
      </div>

      <div className="action-buttons">
        <button onClick={onExport}>
          📤 Export (JSON)
        </button>
        <button onClick={() => fileInputRef.current?.click()}>
          📥 Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImport}
        />
      </div>
    </div>
  );
}

export default Filters; // ✅ Eksport qismi MUHIM
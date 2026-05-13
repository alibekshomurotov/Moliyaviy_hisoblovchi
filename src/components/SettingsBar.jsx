import { useApp } from '../context/AppContext';

function SettingsBar() {
  const { language, setLanguage, currency, setCurrency } = useApp();

  return (
    <div className="settings-bar">
      <div className="settings-group">
        <label>🌐 Til:</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="uz">O'zbekcha</option>
          <option value="en">English</option>
          <option value="ru">Русский</option>
        </select>
      </div>

      <div className="settings-group">
        <label>💱 Valyuta:</label>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="UZS">🇺🇿 So'm</option>
          <option value="USD">🇺🇸 Dollar</option>
          <option value="RUB">🇷🇺 Rubl</option>
        </select>
      </div>
    </div>
  );
}

export default SettingsBar; // ✅ Eksport qismi MUHIM
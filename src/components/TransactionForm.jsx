import { useState } from 'react';

const CATEGORIES = ['Oziq-ovqat', 'Transport', 'Kommunal', "Sovg'alar", 'Kiyim', 'Boshqa'];

function TransactionForm({ onAddTransaction }) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'Oziq-ovqat',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;
    
    onAddTransaction({
      ...formData,
      amount: parseFloat(formData.amount),
      id: Date.now()
    });
    
    setFormData({
      ...formData,
      description: '',
      amount: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <input
        type="text"
        placeholder="Masalan: Taksi, Oziq-ovqat..."
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        required
      />
      
      <input
        type="number"
        placeholder="Summa (so'm)"
        value={formData.amount}
        onChange={(e) => setFormData({...formData, amount: e.target.value})}
        required
      />
      
      <select
        value={formData.type}
        onChange={(e) => setFormData({...formData, type: e.target.value})}
      >
        <option value="income">💰 Kirim</option>
        <option value="expense">💸 Chiqim</option>
      </select>
      
      {formData.type === 'expense' && (
        <select
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
        >
          {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
        </select>
      )}
      
      <input
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({...formData, date: e.target.value})}
      />
      
      <button type="submit">➕ Qo'shish</button>
    </form>
  );
}

export default TransactionForm;
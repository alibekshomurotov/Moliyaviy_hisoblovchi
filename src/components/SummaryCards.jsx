import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

function SummaryCards({ transactions }) {
  const { formatAmount } = useApp();

  const { totalIncome, totalExpense, balance, topCategory } = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    
    // Kategoriyalar bo'yicha harajatlar
    const categoryExpense = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categoryExpense[t.category] = (categoryExpense[t.category] || 0) + t.amount;
    });
    
    const topCategoryEntry = Object.entries(categoryExpense).sort((a, b) => b[1] - a[1])[0];
    const top = topCategoryEntry ? { category: topCategoryEntry[0], amount: topCategoryEntry[1] } : null;
    
    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      topCategory: top
    };
  }, [transactions]);

  return (
    <div className="summary-cards">
      <div className="card income">
        <h3>💰 Jami Kirim</h3>
        <p>{formatAmount(totalIncome)}</p>
      </div>
      
      <div className="card expense">
        <h3>💸 Jami Chiqim</h3>
        <p>{formatAmount(totalExpense)}</p>
      </div>
      
      <div className="card balance">
        <h3>⚖️ Balans</h3>
        <p className={balance >= 0 ? 'positive' : 'negative'}>
          {formatAmount(balance)}
        </p>
      </div>
      
      {topCategory && (
        <div className="card top-category">
          <h3>📊 Eng ko'p sarflangan</h3>
          <p>{topCategory.category}</p>
          <small>{formatAmount(topCategory.amount)}</small>
        </div>
      )}
    </div>
  );
}

export default SummaryCards; // ✅ Eksport qismi MUHIM
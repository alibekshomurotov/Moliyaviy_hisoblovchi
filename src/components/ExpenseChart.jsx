import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

function ExpenseChart({ transactions }) {
  const { formatAmount } = useApp();

  const { categoryData, monthlyData } = useMemo(() => {
    // Kategoriyalar bo'yicha harajatlar
    const categoryExpense = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categoryExpense[t.category] = (categoryExpense[t.category] || 0) + t.amount;
    });
    const categoryData = Object.entries(categoryExpense).map(([name, value]) => ({ name, value }));
    
    // Oylik ma'lumotlar
    const monthlyData = {};
    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      monthlyData[month][t.type] += t.amount;
    });
    const monthlyChartData = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data
    }));
    
    return { categoryData, monthlyData: monthlyChartData };
  }, [transactions]);

  return (
    <div className="charts-container">
      <div className="chart">
        <h3>🏷️ Kategoriyalar bo'yicha harajatlar</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatAmount(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="chart">
        <h3>📅 Oylik taqqoslash</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatAmount(value)} />
            <Tooltip formatter={(value) => formatAmount(value)} />
            <Legend />
            <Bar dataKey="income" fill="#4caf50" name="Kirim" />
            <Bar dataKey="expense" fill="#f44336" name="Chiqim" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ExpenseChart; // ✅ Eksport qismi MUHIM
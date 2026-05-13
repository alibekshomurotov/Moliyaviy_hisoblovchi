export const calculateTotal = (transactions, type) => {
  return transactions
    .filter(t => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getCategoryTotals = (transactions) => {
  const expenses = transactions.filter(t => t.type === 'expense');
  const categoryTotals = {};
  
  expenses.forEach(expense => {
    if (categoryTotals[expense.category]) {
      categoryTotals[expense.category] += expense.amount;
    } else {
      categoryTotals[expense.category] = expense.amount;
    }
  });
  
  return categoryTotals;
};

export const getTopCategory = (categoryTotals) => {
  if (Object.keys(categoryTotals).length === 0) return null;
  
  return Object.entries(categoryTotals).reduce((max, [cat, amount]) => 
    amount > max.amount ? { category: cat, amount } : max,
    { category: '', amount: 0 }
  );
};

export const getMonthlyData = (transactions) => {
  const monthlyData = {};
  
  transactions.forEach(t => {
    const month = new Date(t.date).toLocaleString('default', { month: 'short' });
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expense: 0 };
    }
    monthlyData[month][t.type] += t.amount;
  });
  
  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    ...data
  }));
};
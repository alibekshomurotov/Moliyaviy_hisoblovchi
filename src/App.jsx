import { useState, useMemo } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import useTheme from './hooks/useTheme';
import { AppProvider, useApp } from './context/AppContext';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import SummaryCards from './components/SummaryCards';
import ExpenseChart from './components/ExpenseChart';
import ThemeToggle from './components/ThemeToggle';
import AIAssistant from './components/AIAssistant';
import Filters from './components/Filters';
import SettingsBar from './components/SettingsBar';
import './App.css';

function AppContent() {
  const [transactions, setTransactions] = useLocalStorage('transactions', []);
  const [theme, setTheme] = useTheme();
  const [filter, setFilter] = useState({ type: 'all', dateRange: { start: '', end: '' } });
  const { formatAmount } = useApp();

  const addTransaction = (newTransaction) => {
    setTransactions([...transactions, newTransaction]);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (data) => {
    if (Array.isArray(data) && confirm(`${data.length} ta tranzaksiya import qilinsinmi?`)) {
      setTransactions([...transactions, ...data]);
    }
  };

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];
    if (filter.type !== 'all') {
      filtered = filtered.filter(t => t.type === filter.type);
    }
    if (filter.dateRange.start) {
      filtered = filtered.filter(t => t.date >= filter.dateRange.start);
    }
    if (filter.dateRange.end) {
      filtered = filtered.filter(t => t.date <= filter.dateRange.end);
    }
    return filtered;
  }, [transactions, filter]);

  const totalIncome = useMemo(() => {
    return transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  }, [transactions]);

  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  return (
    <div className={`app ${theme}`}>
      <header>
        <div className="header-left">
          <h1>📊 Shaxsiy Moliya Dashboard</h1>
          <p>💰 Kirim va chiqimlaringizni aqlli tarzda boshqaring</p>
          {transactions.length > 0 && (
            <div className="savings-badge">
              {savings >= 0 ? (
                <span className="positive">💚 Tejamkorlik: {formatAmount(savings)} ({savingsRate.toFixed(1)}%)</span>
              ) : (
                <span className="negative">❤️ Kamomad: {formatAmount(Math.abs(savings))}</span>
              )}
            </div>
          )}
        </div>
        <div className="header-right">
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </header>
      
      <main>
        <SettingsBar />
        <TransactionForm onAddTransaction={addTransaction} />
        <SummaryCards transactions={filteredTransactions} />
        <Filters 
          onFilterChange={setFilter}
          onExport={exportData}
          onImport={importData}
        />
        {filteredTransactions.length > 0 && <ExpenseChart transactions={filteredTransactions} />}
        <TransactionList 
          transactions={filteredTransactions}
          onDeleteTransaction={deleteTransaction}
        />
      </main>
      
      <footer>
        <small>📌 Barcha ma'lumotlar brauzeringizda xavfsiz saqlanadi | {transactions.length} ta tranzaksiya</small>
      </footer>

      <AIAssistant transactions={transactions} />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
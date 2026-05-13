import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

// Valyutalar - EKSPORT QILINADI
export const currencies = {
  UZS: { symbol: 'so\'m', rate: 1, label: '🇺🇿 Uzbek so\'m' },
  USD: { symbol: '$', rate: 12900, label: '🇺🇸 Dollar' },
  RUB: { symbol: '₽', rate: 145, label: '🇷🇺 Rubl' }
};

// Tillar - EKSPORT QILINADI
export const languages = {
  uz: {
    name: 'O\'zbekcha',
    income: 'Kirim',
    expense: 'Chiqim',
    balance: 'Balans',
    totalIncome: 'Jami Kirim',
    totalExpense: 'Jami Chiqim',
    topCategory: 'Eng ko\'p sarflangan',
    add: 'Qo\'shish',
    description: 'Masalan: Taksi, Oziq-ovqat...',
    amount: 'Summa',
    date: 'Sana',
    transactions: 'So\'nggi operatsiyalar',
    noTransactions: 'Hech qanday tranzaksiya yo\'q',
    export: 'Export (JSON)',
    import: 'Import',
    filterAll: 'Hammasi',
    filterIncome: 'Kirimlar',
    filterExpense: 'Chiqimlar',
    category: 'Kategoriya',
    byDate: 'Sana bo\'yicha',
    mostSpent: 'Eng ko\'p sarflangan',
    monthlyComparison: 'Oylik taqqoslash',
    byCategory: 'Kategoriyalar bo\'yicha',
    personalFinance: 'Shaxsiy Moliya Dashboard',
    subtitle: 'Kirim va chiqimlaringizni aqlli tarzda boshqaring',
    dataSaved: 'Barcha ma\'lumotlar brauzeringizda xavfsiz saqlanadi',
    transactionsCount: 'ta tranzaksiya',
    importConfirm: 'ta tranzaksiya import qilinsinmi?',
    invalidFile: 'Xato: noto\'g\'ri fayl formati'
  },
  en: {
    name: 'English',
    income: 'Income',
    expense: 'Expense',
    balance: 'Balance',
    totalIncome: 'Total Income',
    totalExpense: 'Total Expense',
    topCategory: 'Top Category',
    add: 'Add',
    description: 'E.g.: Taxi, Grocery...',
    amount: 'Amount',
    date: 'Date',
    transactions: 'Recent Transactions',
    noTransactions: 'No transactions yet',
    export: 'Export (JSON)',
    import: 'Import',
    filterAll: 'All',
    filterIncome: 'Incomes',
    filterExpense: 'Expenses',
    category: 'Category',
    byDate: 'Filter by date',
    mostSpent: 'Most spent on',
    monthlyComparison: 'Monthly Comparison',
    byCategory: 'Expenses by Category',
    personalFinance: 'Personal Finance Dashboard',
    subtitle: 'Smartly manage your income and expenses',
    dataSaved: 'All data is securely stored in your browser',
    transactionsCount: 'transactions',
    importConfirm: 'transactions to import?',
    invalidFile: 'Error: Invalid file format'
  },
  ru: {
    name: 'Русский',
    income: 'Доход',
    expense: 'Расход',
    balance: 'Баланс',
    totalIncome: 'Общий доход',
    totalExpense: 'Общий расход',
    topCategory: 'Частая трата',
    add: 'Добавить',
    description: 'Например: Такси, Продукты...',
    amount: 'Сумма',
    date: 'Дата',
    transactions: 'Последние операции',
    noTransactions: 'Нет транзакций',
    export: 'Экспорт (JSON)',
    import: 'Импорт',
    filterAll: 'Все',
    filterIncome: 'Доходы',
    filterExpense: 'Расходы',
    category: 'Категория',
    byDate: 'По дате',
    mostSpent: 'Чаще всего тратят',
    monthlyComparison: 'Сравнение по месяцам',
    byCategory: 'Расходы по категориям',
    personalFinance: 'Финансовый дашборд',
    subtitle: 'Умное управление доходами и расходами',
    dataSaved: 'Все данные безопасно хранятся в вашем браузере',
    transactionsCount: 'транзакций',
    importConfirm: 'транзакций импортировать?',
    invalidFile: 'Ошибка: Неверный формат файла'
  }
};

export function AppProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'uz';
  });
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'UZS';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const t = languages[language];
  const currentCurrency = currencies[currency];

  const convertAmount = (amountInUZS) => {
    return amountInUZS / currentCurrency.rate;
  };

  const formatAmount = (amountInUZS) => {
    const converted = convertAmount(amountInUZS);
    return `${converted.toLocaleString(undefined, { 
      minimumFractionDigits: currency === 'UZS' ? 0 : 2,
      maximumFractionDigits: currency === 'UZS' ? 0 : 2 
    })} ${currentCurrency.symbol}`;
  };

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      currency,
      setCurrency,
      t,
      currentCurrency,
      convertAmount,
      formatAmount
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
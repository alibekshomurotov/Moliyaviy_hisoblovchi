import { useApp } from '../context/AppContext';

function TransactionList({ transactions, onDeleteTransaction }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="transaction-list">
        <h3>📋 So'nggi operatsiyalar</h3>
        <p>Hech qanday tranzaksiya yo'q</p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      <h3>📋 So'nggi operatsiyalar</h3>
      <ul>
        {[...transactions].reverse().map(transaction => (
          <li key={transaction.id} className={`transaction-item ${transaction.type}`}>
            <div>
              <strong>{transaction.description}</strong>
              <small>{transaction.date}</small>
              {transaction.category && <span className="category">{transaction.category}</span>}
            </div>
            <div>
              <span className="amount">
                {transaction.type === 'income' ? '+ ' : '- '}
                {transaction.amount.toLocaleString()} so'm
              </span>
              <button onClick={() => onDeleteTransaction(transaction.id)}>❌</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionList;
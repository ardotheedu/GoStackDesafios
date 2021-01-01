import Transaction from '../models/Transaction';
import CreateTransactionService from '../services/CreateTransactionService';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}
interface CreateTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}

class TransactionsRepository {
  private transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  public all(): Transaction[] {
    // TODO
    return this.transactions;
  }

  public getBalance(): Balance {
    // TODO
    const { income, outcome } = this.transactions.reduce(
      (accumulator: Balance, currentValue: Transaction) => {
        // accumulator é o que vai acumular o valor do income e outcome
        // cujo o valor foi definido a baixo
        // currentValue è a transaction atual
        switch (currentValue.type) {
          case 'income':
            accumulator.income += currentValue.value;
            break;
          case 'outcome':
            accumulator.outcome += currentValue.value;
            break;
          default case
            break
        }
        return accumulator;
      },
      {
        income: 0,
        outcome: 0, // -> Valores inicais do accumulator
        total: 0,
      },
    );
    const total = income - outcome;
    return { income, outcome, total };
  }

  public create({ title, value, type }: CreateTransaction): Transaction {
    // TODO
    const transaction = new Transaction({ title, value, type });

    this.transactions.push(transaction);

    return transaction;
  }
}

export default TransactionsRepository;

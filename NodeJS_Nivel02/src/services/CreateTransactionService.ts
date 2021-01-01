import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import {v4 as uuid} from 'uuid'

interface Request {
  title: string,
  value: number,
  type: 'income' | 'outcome'
}
class CreateTransactionService {
  private transactionsRepository: TransactionsRepository;

  constructor(transactionsRepository: TransactionsRepository) {
    this.transactionsRepository = transactionsRepository;
  }

  public execute({title, value, type}: Request): Transaction {
    // TODO
    if(!['income', 'outcome'].includes(type)) { // -> se no type não estiver incluido
      // o income ou o outcome ele vai retornar false (por causa do !)
      throw new Error('Invalid type')
    }
    const {total} = this.transactionsRepository.getBalance()

    if (type === 'outcome' && total < value) {
      throw new Error('You dont have enough balance')
    }
    const transaction = this.transactionsRepository.create({
      title,
      value,
      type,
    })
    return transaction
  }
}

export default CreateTransactionService;

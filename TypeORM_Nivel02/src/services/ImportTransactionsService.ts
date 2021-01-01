import csvParse from 'csv-parse';
import fs from 'fs';
import { getCustomRepository, getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface CSVTransactions {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const contactsReadStream = fs.createReadStream(filePath);
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const parsers = csvParse({
      from_line: 2, // Vai começar a parsear da lina 2 ignorando o header que tem o nome title, type, ...
    });

    const parseCSV = contactsReadStream.pipe(parsers);
    // O pipe vai lendo as linhas conforme elas vão ficando disponiveis para leitura
    const transactions: CSVTransactions[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      // Vai destruturar cada linha
      // vai desustrurar os valores abaixo do line
      const [title, type, value, category] = line.map(
        (cell: string) =>
          // vai desustruturar cada celula
          cell.trim(),
        // Vai tirar os espaços
      );
      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve)); // -> vai esperar o parserCSV terminar de executar
    // vai verificar se o parseCSV emitiu um evento chamado 'end' quando o evento 'end', for emito ele continua

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
        // O metodo In vai falar se existe alguma das categorias que estão no array no banco de dados
      },
    });

    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const addCategoriesTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category)) // Vai retorna todas as categories que não existirem no banco de dados
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategoriesTitles.map(title => ({
        title,
      })),
    );
    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];
    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createdTransactions);

    await fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;

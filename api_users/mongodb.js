import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function testConnection() {
  const client = new MongoClient(process.env.DATABASE_URL);
  try {
    await client.connect();
    console.log('Conexão bem-sucedida!');
  } catch (err) {
    console.error('Erro ao conectar:', err);
  } finally {
    await client.close();
  }
}


testConnection();
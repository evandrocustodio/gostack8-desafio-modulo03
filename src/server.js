import 'dotenv/config';
import app from './app';

app.get('/', async (req, res) => {
  return res.status(200).json({ version: '1.0.0' });
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor Iniciado na porta ${process.env.PORT}.`);
});

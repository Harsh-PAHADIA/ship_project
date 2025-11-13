import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from '../adapters/inbound/routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`FuelEU backend running on http://localhost:${port}/api`);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import analyzeRouter from './routes/analyze.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));
app.use('/api', analyzeRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Unmake AI Reverse Engineering Backend',
    model: 'Gemini 2.5 Flash / Gemma 4'
  });
});

app.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`⚡ Unmake AI Reverse-Engineering Server`);
  console.log(`🌐 Server running at http://localhost:${PORT}`);
  console.log(`🔑 Connected with Google Generative AI`);
  console.log(`=================================================\n`);
});

import { prisma } from "./lib/prisma";
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get("/health/db", async (_req, res) => {
    const users = await prisma.user.count();
    res.status(200).json({ status: 'ok', users });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
    console.log(`API running on port ${port}`);
});
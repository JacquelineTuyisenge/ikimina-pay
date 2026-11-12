import { prisma } from "./lib/prisma";
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { authRouter } from "./routes/auth";
import { groupsRouter } from "./routes/groups";
import { contributionsRouter } from "./routes/contributions";
import { paymentsRouter } from "./routes/payments";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);
app.use("/groups", groupsRouter, contributionsRouter);
app.use(paymentsRouter);

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
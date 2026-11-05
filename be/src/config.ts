import "dotenv/config";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET is missing. Add it to your .env file.");
}

export const JWT_SECRET: string = jwtSecret;
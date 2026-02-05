import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import './config/mongo';
import './config/postgres';
import './config/redis';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Analytics Dashboard API ready`);
});
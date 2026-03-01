require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/Index');
const { testDBConnection } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/Errorhandler');

const app = express();

app.use(cors());
app.use(express.json());

// Mount all API routes
app.use('/api', apiRoutes);

// 404 handler — must come after routes
app.use(notFound);

// Global error handler — must be last
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await testDBConnection();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
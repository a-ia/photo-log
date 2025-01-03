const express = require('express');
const photoLogRouter = require('./src/server/server');

const app = express();
const port = process.env.PORT || 8228;

app.use('/log', photoLogRouter);

app.listen(port, () => {
  console.log(`Photo Log server running on port ${port}`);
});

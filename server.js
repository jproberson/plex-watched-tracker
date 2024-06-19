const express = require('express');
const path = require('path');
const indexRouter = require('./routes/index');
require('dotenv').config();

const app = express();
const configDir = path.join(__dirname, 'data');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve the thumbnails directory as static files
app.use('/thumbnails', express.static(path.join(configDir, 'thumbnails')));

app.use('/', indexRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

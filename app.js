const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');
const userController = require('./controller/userController');
const transferController = require('./controller/transferController');
const auth = require('./middleware/auth');

const app = express();
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const userService = require('./service/userService');
// Rotas públicas
app.post('/users/register', userService.register);
app.post('/users/login', userService.login);
// Rotas protegidas
app.use('/users', auth, userController);
app.use('/transfer', auth, transferController);

module.exports = app;

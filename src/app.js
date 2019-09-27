require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const logger = require('./logger');

const cardRouter = require('./cardRouter');
const listRouter = require('./listRouter');



const app = express();
const uuid = require('uuid/v4');

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';
//app.use(express.json()); instead using body parse passing
//it each router.
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());


//Second run authorization 
app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')

    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        logger.error(`Unauthorized request to path: ${req.path}`);
        return res.status(401).json({ error: 'Unauthorized request' })
    }
    // move to the next middleware
    next()
})

app.use('/card', cardRouter)
app.use(listRouter)
//make get post delete run


//if something went wrong throw error handler
app.use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } };
    } else {
        console.error(error)
        response = { message: error.message, error };
    }
    res.status(500).json(response);
})

module.exports = app;
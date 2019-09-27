const express = require('express')
const cardRouter = express.Router()
const uuid = require('uuid/v4')
const logger = require('./logger')
const { cards, lists } = require('./store');


const bodyParser = express.json()



cardRouter
    .route('/')
    .get((req, res) => {
        // move implementation logic into here
        res.json(cards);
    })
    .post(bodyParser, (req, res) => {
        // move implementation logic into here
        const { title, content } = req.body;

        if (!title) {
            logger.error(`Title is required`);
            return res
                .status(400)
                .send('Invalid data');
        }

        if (!content) {
            logger.error(`Content is required`);
            return res
                .status(400)
                .send('Invalid data');
        }
        // check card IDs
        if (cardIds.length > 0) {
            let valid = true;
            cardIds.forEach(cid => {
                const card = cards.find(c => c.id == cid);
                if (!card) {
                    logger.error(`Card with id ${cid} not found in cards array.`);
                    valid = false;
                }
            });

            if (!valid) {
                return res
                    .status(400)
                    .send('Invalid data');
            }
        }

        // get an id
        const id = uuid();

        const card = {
            id,
            title,
            content
        };

        cards.push(card);

        logger.info(`Card with id ${id} created`);

        res
            .status(201)
            .location(`http://localhost:8000/card/${id}`)
            .json(card);
    })

cardRouter
    .route('/:id')
    .get((req, res) => {
        const { id } = req.params;
        const card = cards.find(c => c.id == id);

        // make sure we found a card
        if (!card) {
            logger.error(`Card with id ${id} not found.`);
            return res
                .status(404)
                .send('Card Not Found');
        }

        res.json(card);
    })
    .delete((req, res) => {
        // move implementation logic into here
        const { id } = req.params;

        const cardIndex = cards.findIndex(c => c.id == id);

        if (cardIndex === -1) {
            logger.error(`Card with id ${id} not found.`);
            return res
                .status(404)
                .send('Not found');
        }

        //remove card from lists
        //assume cardIds are not duplicated in the cardIds array
        lists.forEach(list => {
            const cardIds = list.cardIds.filter(cid => cid !== id);
            list.cardIds = cardIds;
        });

        cards.splice(cardIndex, 1);

        logger.info(`Card with id ${id} deleted.`);

        res
            .status(204)
            .end();
    })

module.exports = cardRouter



const Joi = require('joi');
const mongoose = require('mongoose');
const createHash = require('./createhash');

const hashLen = 8;
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const Schema = mongoose.Schema;

const redirSchema = new Schema({
    shortUrl: String,
    url: String,
    createdAt: Date
});

const Redir = mongoose.model('Redir', redirSchema);

module.exports = [
    {
        method: 'GET',
        path: '/',
        handler (request, reply) {
            reply.file('views/index.html');
        }
    },
    {
        method: 'GET',
        path: '/public/{file}',
        handler (request, reply) {
            reply.file(`public/${request.params.file}`);
        }
    },
    {
        method: 'POST',
        path: '/new',
        handler (request, reply) {
            const uniqueId = createHash(hashLen);
            const newRedir = new Redir({
                shortUrl: `${baseUrl}/${uniqueId}`,
                url: request.payload.url,
                createdAt: new Date()
            });

            newRedir.save((err, redir) => {
                if (err) { reply(err); }
                else { reply(redir); }
            });
        },
        config: {
            validate: {
                payload: {
                    url: Joi.string().uri().required()
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/{hash}',
        handler (request, reply) {
            const query = {
                shortUrl: `${baseUrl}/${request.params.hash}`
            };

            Redir.findOne(query, (err, redir) => {
                if (err) { return reply(err); }
                else if (redir) { reply().redirect(redir.url); }
                else { reply.file('views/404.html').code(404); }
            });
        }
    }
];

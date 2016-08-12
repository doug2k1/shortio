const Hapi = require('hapi');
const mongoose = require('mongoose');
const plugins = [
    require('inert')
];
const routes = require('./routes');

const mongoUri = process.env.MOGOURI || 'mopngodb://localhost/shortio';
const server = new Hapi.Server();

// Mongo

const options = {
    server: {
        socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 }
    },
    replset: {
        socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 }
    }
};

mongoose.connect(mongoUri, options);

const db = mongoose.connection;

// Server
server.connection({
    port: process.env.PORT || 3000
});

server.register(plugins, err => {
    if (err) throw err;

    db.on('error', console.error.bind(console, 'connection error: '))
        .once('open', () => {
            server.route(routes);

            server.start(err => {
                if (err) throw err;

                console.log(`Server running at port ${server.info.port}`);
            });
        });
});

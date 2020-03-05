'use strict';

const Path = require('path');
const Hapi = require('@hapi/hapi');
const Hoek = require('@hapi/hoek');
const Inert = require('@hapi/inert');
const dotenv = require('dotenv');

dotenv.config();

const URL_SERVER = process.env.URL_SERVER || 'localhost:8080';

const buildLocks = (rawLocks) => {
    console.log(rawLocks);
    const locks = rawLocks.map((raw)=>{
        let split = raw.split(',');
        return {
            address: split[0],
            name: new Buffer(split[1], 'base64').toString(),
	    encoded: split[1]
        };
    });
    console.log(locks)
    return locks;
};

const init = async () => {
    const server = Hapi.server({ port: 8000, routes: {
        files: {
            relativeTo: Path.join(__dirname, 'public')
        }
    }});

    await server.register(require('@hapi/vision'));
    await server.register(Inert);


    server.route({
        method: 'GET',
        path: '/static/{param*}',
        handler: {
            directory: {
                path: '.',
                redirectToSlash: true,
                index: true,
            }
        }
    });

    server.views({
        engines: {
            html: require('ejs')
        },
        relativeTo: __dirname,
        path: 'templates'
    });

    server.route({
      method: 'GET',
      path: '/',
      handler: async (request, h) => {
	      try {
        return await request.render('generator.html', {server: URL_SERVER})
	      } catch(e) {
	        console.log(e);
	      }
      }
    });

    server.route({
        method: 'GET',
        path: '/locks',
        handler: async (request, h) => {
            const query = request.query;
            try {
                const locks = buildLocks( typeof query.locks === 'string' ? [query.locks] : (query.locks || []));
                return await request.render('locks.html', {query: query.locks, locks, server: URL_SERVER});
            } catch(e) {
                console.log(e);
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/services/oembed',
        handler: async (request, reply) => {
            const query = request.query;

            const locks = buildLocks( typeof query.locks === 'string' ? [query.locks] : (query.locks || []));
            try {
            const oembed_res = {
                type: "rich",
                provider_name: "Unlock",
	              provider_url: URL_SERVER,
                version: "1.0",
                cache_age: "10000",
                width: 500,
                height: 70,
                html: await request.render('oembed', {locks, server: URL_SERVER})
            };
                return oembed_res;
            } catch(e) {
                console.log(e);
            }

        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);

};


process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();

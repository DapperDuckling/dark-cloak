import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import {fastifyStatic} from "@fastify/static";
import * as path from "path";

import {keycloakConnectorFastify} from "keycloak-connector-server";
import {routes} from "./routes.js";
import {AwsRedisClusterProvider} from "keycloak-connector-server-cluster-aws-redis/src/aws-redis-cluster-provider.js";
import type {Logger} from "pino";
import {clusterKeyProvider} from "keycloak-connector-server";

const dotenv = await import('dotenv');
dotenv.config({path: './.env.test'});
dotenv.config({path: './.env.test.local'});
// dotenv.config({path: './tests/integration/fastify/.env.test'});
// dotenv.config({path: './tests/integration/fastify/.env.test.local'});

// Configure fastify
const fastify = Fastify({
    logger: {
        level: "debug",
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
            },
        },
    },
    pluginTimeout: 120000,

    // // Adds option to enable fastify https for testing
    // https: {
    //     key: fs.readFileSync(path.join(__dirname, '../localhost.key.local')),
    //     cert: fs.readFileSync(path.join(__dirname, '../localhost.cert.local')),
    // }
});

// Setup the custom error handler
fastify.setErrorHandler(async (error, request, reply) => {
    // Log error
    fastify.log.error(error);

    // Send the 500 error
    return reply.status(500).sendFile('5XX.html');
});

// Setup the file not found handler
fastify.setNotFoundHandler(async (request, reply) => {
    // Send the 404 not found
    return reply.status(404).sendFile('404.html');
});

// To store the session state cookie
fastify.register(cookie, {
    prefix: "keycloak-connector_",
});

fastify.register(fastifyStatic, {
    root: path.join(path.resolve(), 'public'),
    prefix: '/public/', // optional: default '/'
});

// Create our cluster provider
const awsRedisClusterProvider = new AwsRedisClusterProvider({
    pinoLogger: fastify.log as Logger,
});

// //todo: remove
// await awsRedisClusterProvider.connectOrThrow();
// const result0 = await awsRedisClusterProvider.store("abc1", `just start ${Date.now()}`, null);
// const result1 = await awsRedisClusterProvider.store("abc1", `no lock ${Date.now()}`, null, "no-lock");
// const result2 = await awsRedisClusterProvider.get("abc1");
// const result25 = await awsRedisClusterProvider.lock({
//     key: "no-lock",
//     ttl: 1,
// });
// const result3 = await awsRedisClusterProvider.store("abc1", `with lock ${Date.now()}`, null, "no-lock");
// const result4 = await awsRedisClusterProvider.get("abc1");
// const result5 = await awsRedisClusterProvider.remove("abc1", "no-lock");
// const result55 = await awsRedisClusterProvider.get("abc1");
// const result6 = await awsRedisClusterProvider.remove("abc1");
// const result7 = await awsRedisClusterProvider.get("abc1");
// console.log('done');

// Initialize the keycloak-connector
await fastify.register(keycloakConnectorFastify, {
    serverOrigin: 'http://localhost:3005',
    authServerUrl: 'http://localhost:8080/',
    realm: 'local-dev',
    refreshConfigMins: -1, // Disable for dev testing
    clusterProvider: awsRedisClusterProvider,
    keyProvider: clusterKeyProvider,
});

// // Set and receive a cluster message
// await awsRedisClusterProvider.store("my-token", `the one to rule them all ${Date.now()}`, null);
// const myToken = await awsRedisClusterProvider.get("my-token");
// await awsRedisClusterProvider.remove("my-token");
// const myToken2 = await awsRedisClusterProvider.get("my-token");
//
// const listener = (msg: any) => {
//     console.log("got a message from my-topic");
//     console.log(msg);
// };
// const listener2 = (msg: any) => {
//     console.log("i'm a little teapots");
//     console.log(msg);
// };
// await awsRedisClusterProvider.subscribe("my-topic", listener);
// await awsRedisClusterProvider.publish("my-topic", "really cool message");
// await awsRedisClusterProvider.unsubscribe('my-topic', listener);
// await awsRedisClusterProvider.publish("my-topic", "really cool message2");
//
//
// await awsRedisClusterProvider.subscribe("my-topic2", listener2);
// await awsRedisClusterProvider.publish("my-topic2", "really cool message3");
// await awsRedisClusterProvider.unsubscribe('my-topic2', listener);

// Register our routes
fastify.register(routes);

try {
    await fastify.listen({ port: 3005, host: '0.0.0.0'});
} catch (err) {
    fastify.log.error("Fastify server crashed", err);
    console.log(err);
    process.exit(1);
}
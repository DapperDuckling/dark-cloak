import type {FastifyPluginAsync} from "fastify";
import type {FastifyKeycloakInstance} from "keycloak-connector-server";

export const routes: FastifyPluginAsync = async (fastify: FastifyKeycloakInstance, options) =>  {

    // Define the basic route
    fastify.get('s', groupAuth('oij'))
    fastify.get('/', {config: {public: true}}, async (request, reply) => {
        return { hello: 'world1' };
    });

    // Define protected routes
    fastify.get('/protected', async (request, reply) => {
        return { hello: 'PROTECTED BOI -- but no role requirement' };
    });

    // Define the basic route
    fastify.get('/coolguy', {config: {roles: ['COOL_GUY']}}, async (request, reply) => {
        return { hello: 'PROTECTED BOI -- must have COOL_GUY role' };
    });

    fastify.get('/no_chance', {config: {roles: ['no_chance_role']}}, async (request, reply) => {
        return { hello: 'PROTECTED BOI -- must have no_chance_role role' };
    });

    fastify.get('/roles_only', {config: ['no_chance_role']}, async (request, reply) => {
        return { hello: 'PROTECTED BOI -- must have no_chance_role role' };
    });
}
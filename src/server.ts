import { fastify } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { fastifyCors } from '@fastify/cors';
import { sql } from './db/conection.ts';
import { env } from './env.ts';
import { getRoomsRouts } from './http/routes/get-rooms.ts';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: 'http://localhost:5173',
});
app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.get('/health', () => {
  return { status: 'ok' };
});
app.register(getRoomsRouts);

app.listen({ port: env.PORT }).then(() => {
  console.log(`Server rodando na porta ${env.PORT}!!!"`);
});

import { fastifyCors } from '@fastify/cors';
import { fastify } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from './env.ts';
import { getRoomsRoute } from './http/routes/get-rooms.ts';
import { crerateRoomRoute } from './http/routes/create-rooms.ts';
import { getRoomsQuestionsRoute } from './http/routes/get-rooms-questions.ts';
import { createQuestionsRoute } from './http/routes/create-questions.ts';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: 'http://localhost:5173',
});
app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.get('/health', () => {
  return { status: 'ok' };
});
app.register(getRoomsRoute);
app.register(crerateRoomRoute);
app.register(getRoomsQuestionsRoute);
app.register(createQuestionsRoute);

app.listen({ port: env.PORT }).then(() => {
  console.log(`Server rodando na porta ${env.PORT}!!!"`);
});

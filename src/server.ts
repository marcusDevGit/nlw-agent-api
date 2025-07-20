import { fastifyCors } from '@fastify/cors';
import { fastifyMultipart } from '@fastify/multipart';
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
import { uploadAudioRoute } from './http/routes/upload-audio.ts';
const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: ['http://localhost:5173', '*'],
  credentials: true,
});

app.register(fastifyMultipart);
app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.get('/health', () => {
  return { status: 'ok' };
});
app.register(getRoomsRoute);
app.register(crerateRoomRoute);
app.register(getRoomsQuestionsRoute);
app.register(createQuestionsRoute);
app.register(uploadAudioRoute);

app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
  console.log(`Server rodando na porta ${env.PORT}!!!"`);
});

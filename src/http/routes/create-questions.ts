import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { db } from '../../db/conection.ts';
import { schema } from '../../db/schema/index.ts';

export const createQuestionsRoute: FastifyPluginCallbackZod = async (app) => {
  app.post(
    '/rooms/:roomId/questions',
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
        body: z.object({
          question: z.string().min(1),
        }),
      },
    },
    async (request, reply) => {
      const { roomId } = request.params;
      const { question } = request.body;

      const result = await db.insert(schema.questions).values({ roomId, question }).returning();

      const insertedQuestion = result[0];

      if (!insertedQuestion) {
        throw new Error('Falha ao criar a pergunta!');
      }
      return reply.status(201).send({ questionId: insertedQuestion.id });
    }
  );
};

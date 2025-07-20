import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { db } from '../../db/conection.ts';
import { schema } from '../../db/schema/index.ts';
import { z } from 'zod/v4';
import { desc, eq } from 'drizzle-orm';
import { questions } from '../../db/schema/questions.ts';

export const getRoomsQuestionsRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/rooms/:roomId/questions',
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
      },
    },
    async (request) => {
      const { roomId } = request.params;

      // console.log(roomId);

      const result = await db
        .select({
          id: schema.questions.id,
          question: schema.questions.question,
          answer: schema.questions.answer,
          createdAt: schema.questions.createdAt,
        })
        .from(schema.questions)
        .where(eq(schema.questions.roomId, roomId))
        .orderBy(desc(schema.questions.createdAt));

      return result;
    }
  );
};

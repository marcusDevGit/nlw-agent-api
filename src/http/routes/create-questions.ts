import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { db } from '../../db/conection.ts';
import { schema } from '../../db/schema/index.ts';
import { generateAnswer, generateEmbeddings } from '../../services/gemini.ts';
import { eq, sql, and } from 'drizzle-orm';

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

      const embedding = await generateEmbeddings(question);

      const embeddingsAsString = `[${embedding.join(',')}]`;

      const chunks = await db
        .select({
          id: schema.audioChunks.id,
          transcription: schema.audioChunks.transcription,
          similarity: sql<number>`1 - (${schema.audioChunks.embedding} <=> ${embeddingsAsString}::vector) `,
        })
        .from(schema.audioChunks)
        .where(
          and(
            eq(schema.audioChunks.roomId, roomId),
            sql`1 - (${schema.audioChunks.embedding} <=> ${embeddingsAsString}::vector) > 0.7`
          )
        )
        .orderBy(sql`${schema.audioChunks.embedding} <=> ${embeddingsAsString}::vector`)
        .limit(3);

      let answer: string | null = null;

      if (chunks.length > 0) {
        const transcription = chunks.map((chunk) => chunk.transcription);

        answer = await generateAnswer(question, transcription);
      }

      const result = await db
        .insert(schema.questions)
        .values({ roomId, question, answer })
        .returning();

      const insertedQuestion = result[0];

      if (!insertedQuestion) {
        throw new Error('Falha ao criar a pergunta!');
      }
      return reply.status(201).send({
        questionId: insertedQuestion.id,
        answer,
      });
    }
  );
};

import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { generateEmbeddings, transcribeAudio } from '../../services/gemini.ts';
import { schema } from '../../db/schema/index.ts';
import { db } from '../../db/conection.ts';

export const uploadAudioRoute: FastifyPluginCallbackZod = async (app) => {
  app.post(
    '/rooms/:roomId/audio',
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { roomId } = request.params;
      const audio = await request.file();

      if (!audio) {
        throw new Error('Audio e nescesario');
      }

      const audioBuffer = await audio.toBuffer();
      const audioAsBase64 = audioBuffer.toString('base64');

      const transcription = await transcribeAudio(audioAsBase64, audio.mimetype);
      const embeddings = await generateEmbeddings(transcription);

      const result = await db
        .insert(schema.audioChunks)
        .values({
          roomId,
          transcription,
          embedding: embeddings,
        })
        .returning();

      const chunk = result[0];

      if (!chunk) {
        throw new Error('Erro ao salvar chunk de audio!');
      }

      return reply.status(201).send({ chunkId: chunk.id });
    }
  );
};

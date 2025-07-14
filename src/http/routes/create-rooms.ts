import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { db } from '../../db/conection.ts';
import { schema } from '../../db/schema/index.ts';

export const crerateRoomRoute: FastifyPluginCallbackZod = async (app) => {
  app.post(
    '/rooms',
    {
      schema: {
        body: z.object({
          name: z.string().min(1),
          description: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { name, description } = request.body;

      const result = await db
        .insert(schema.rooms)
        .values({
          name,
          description,
        })
        .returning();

      const insertedRoom = result[0];

      if (!insertedRoom) {
        throw new Error('Falha ao criar a sala!');
      }
      return reply.status(201).send({ roomId: insertedRoom.id });
    }
  );
};

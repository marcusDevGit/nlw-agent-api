import { pgTable, uuid, text, timestamp, vector } from 'drizzle-orm/pg-core';
import { rooms } from './rooms.ts';

export const audioChunks = pgTable('audio_chunks', {
  id: uuid().primaryKey().defaultRandom(),
  roomId: uuid()
    .references(() => rooms.id)
    .notNull(),
  transcription: text().notNull(),
  embedding: vector({ dimensions: 768 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

import { defineCollection, z } from 'astro:content';

const docsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number().optional(),
    section: z.string().optional(),
  }),
});

const architectureCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number().optional(),
  }),
});

const referenceCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    languages: z.array(z.enum(['cli', 'python', 'node', 'mcp'])).optional(),
  }),
});

export const collections = {
  docs: docsCollection,
  architecture: architectureCollection,
  reference: referenceCollection,
};

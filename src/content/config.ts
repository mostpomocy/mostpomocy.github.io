import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    author: z.string().default('Most Pomocy'),
    thumbnail: z.string().optional(),
    description: z.string(),
    tags: z.array(z.string()).default(['pomoc'])
  })
});

const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    type: z.enum(['page', 'mapa']),
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default(['pomoc'])
  })
});

export const collections = {
  'blog': blogCollection,
  'pages': pagesCollection,
};

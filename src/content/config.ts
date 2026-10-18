import { defineCollection, z } from 'astro:content';

const seoSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20).max(170),
});

const articleSchema = z.object({
  title: z.string(),
  description: z.string(),
  publicationDate: z.coerce.date(),
  lastUpdated: z.coerce.date().optional(),
  featuredImage: z.string(),
  featuredImageAlt: z.string(),
  author: z.string(),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  seo: seoSchema,
});

const supportCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
      shortDescription: z.string(),
    problemDescription: z.string(),
    odCzegoZaczac: z.array(z.string()).min(1),
    kiedySzukacWsparcia: z.array(z.string()).min(1),
    formyPomocy: z.array(z.string()).min(1),
    pierwszyKontakt: z.array(z.string()).min(1),
    wazneInformacje: z.array(z.string()).min(1),
    kontakty: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          phone: z.string().optional(),
          website: z.string().optional(),
          verified: z.boolean().default(false),
        }),
      )
      .default([]),
    zrodla: z
      .array(
        z.object({
          title: z.string(),
          url: z.string(),
        }),
      )
      .default([]),
    relatedArticles: z.array(z.string()).default([]),
    seo: seoSchema,
  }),
});

const cityCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
      heroTitle: z.string(),
    heroSubtitle: z.string(),
    heroDescription: z.string(),
    sections: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        points: z.array(z.string()).default([]),
      }),
    ),
    seo: seoSchema,
  }),
});

const blogPolska = defineCollection({ type: 'content', schema: articleSchema });
const blogSosnowiec = defineCollection({ type: 'content', schema: articleSchema });

export const collections = {
  'blog-polska': blogPolska,
  'blog-sosnowiec': blogSosnowiec,
  wsparcie: supportCollection,
  miasta: cityCollection,
};

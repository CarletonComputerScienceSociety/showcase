import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // Who built it. At least one; each author may optionally link to one place
      // (personal site, GitHub, LinkedIn, …).
      builtBy: z
        .array(
          z.object({
            name: z.string(),
            url: z.url().optional(),
          }),
        )
        .min(1),
      tech: z.array(z.string()),
      year: z.number(),
      // Constrained category used for gallery filtering. Adding a new value here
      // is backward-compatible (existing entries stay valid); renaming/removing
      // one is not. Keep the value->label map (filter UI / CONTRIBUTING) in sync.
      domain: z.enum([
        'web',
        'mobile',
        'ai-ml',
        'cybersecurity',
        'game-dev',
        'hardware',
        'systems',
        'infrastructure',
      ]),
      github: z.url(),
      deploy: z.url().optional(),
      cover: image(),
    }),
});

const webring = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/webring' }),
  schema: z.object({
    name: z.string(),
    url: z.url(),
    year: z.number(), // graduation year
    inRing: z.boolean(),
  }),
});

export const collections = { projects, webring };

import { z } from "zod";

export const JobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().min(1),
  url: z.string().url(),
  source: z.string(),
  category: z.string().optional(),
  description: z.string().optional(),
  postedDate: z.string().optional(),
});

export type JobResult = z.infer<typeof JobSchema>;

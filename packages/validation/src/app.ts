import { z } from "zod";

export const CreateServiceSchema = z.object({
  name: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  slotMinutes: z.number().int().positive(),
  minNoticeMinutes: z.number().int().nonnegative().optional(),
  bufferBeforeMinutes: z.number().int().nonnegative().optional(),
  bufferAfterMinutes: z.number().int().nonnegative().optional(),
  priceCents: z.number().int().nonnegative().nullable().optional(),
});

export type CreateService = z.infer<typeof CreateServiceSchema>;

export const UpdateServiceSchema = CreateServiceSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Pelo menos um campo deve ser informado" },
);

export type UpdateService = z.infer<typeof UpdateServiceSchema>;

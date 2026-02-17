import { z } from "zod";

export const PublicCreateAppointmentSchema = z.object({
  serviceId: z.string().uuid(),
  startAt: z.string().datetime(),
  fullName: z.string().min(3),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export type PublicCreateAppointment = z.infer<typeof PublicCreateAppointmentSchema>;

export const PublicCancelAppointmentSchema = z.object({
  reason: z.string().optional(),
});

export type PublicCancelAppointment = z.infer<typeof PublicCancelAppointmentSchema>;

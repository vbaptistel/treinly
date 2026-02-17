import { z } from "zod";

export const AvailabilityQuerySchema = z.object({
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type AvailabilityQuery = z.infer<typeof AvailabilityQuerySchema>;

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

export interface PublicBranding {
  logoUrl?: string;
  heroImageUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontHeading?: string;
  fontBody?: string;
}

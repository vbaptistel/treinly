import { z } from "zod";

// --- Services ---

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

// --- Appointments (panel) ---

export const AppointmentsQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});

export type AppointmentsQuery = z.infer<typeof AppointmentsQuerySchema>;

export const PatchAppointmentSchema = z.object({
  action: z.enum(["cancel", "no_show", "done", "set_billing"]),
  billingStatus: z.enum(["PAID_MANUAL", "WAIVED"]).optional(),
  reason: z.string().optional(),
});

export type PatchAppointment = z.infer<typeof PatchAppointmentSchema>;

// --- Customers ---

export const CreateCustomerSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export type CreateCustomer = z.infer<typeof CreateCustomerSchema>;

// --- Plans ---

export const CreatePlanSchema = z.object({
  type: z.enum(["PACKAGE", "MONTHLY"]),
  sessionsTotal: z.number().int().positive(),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type CreatePlan = z.infer<typeof CreatePlanSchema>;

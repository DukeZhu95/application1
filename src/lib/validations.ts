import { z } from "zod";

export const classCodeSchema = z
    .string()
    .length(6, "Class code must be exactly 6 characters")
    .regex(/^[A-Za-z0-9]+$/, "Class code can only contain letters and numbers");
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const mfaVerificationSchema = z.object({
  email: z.string().email(),
  token: z.string().length(6, 'TOTP token must be 6 digits'),
});

export const elevatorCommandSchema = z.object({
  elevatorId: z.string().uuid(),
  commandType: z.enum([
    'DISPATCH_CALL',
    'PARK_FLOOR',
    'SET_SERVICE_MODE',
    'DOOR_HOLD',
    'CLEAR_FAULT',
  ]),
  parameters: z.record(z.any()),
  idempotencyKey: z.string().min(10),
});

export const bookingCreateSchema = z.object({
  buildingId: z.string().uuid(),
  elevatorId: z.string().uuid(),
  purpose: z.enum([
    'MOVING',
    'FURNITURE_DELIVERY',
    'GOODS',
    'COMMERCIAL_DELIVERY',
    'SERVICE_MAINTENANCE',
  ]),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  contactName: z.string().min(2),
  contactPhone: z.string().min(10),
  notes: z.string().optional(),
});

export const callRequestSchema = z.object({
  buildingId: z.string().uuid(),
  elevatorId: z.string().uuid().optional(),
  pickupFloor: z.number().int(),
  destinationFloor: z.number().int().optional(),
  callType: z.enum(['LANDING', 'DESTINATION', 'VIP']).default('LANDING'),
});


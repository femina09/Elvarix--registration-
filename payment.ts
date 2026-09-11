import type { RegistrationType } from "../types";

/**
 * ELVARIX'26 payment configuration.
 *
 * — To change the UPI ID shown on the Payment page, edit UPI_ID below.
 * — To change the QR code, replace the image file at:
 *     public/assets/payment-qr.png
 *   with your own QR code image, keeping the same filename. No code changes
 *   needed — Vite serves everything in public/ as-is at build time.
 * — FEE_BY_REGISTRATION_TYPE is the per-person fee, keyed by registration
 *   type. For team events the total is this fee × number of people (leader +
 *   members) — see PaymentStep.tsx.
 */

export const UPI_ID = "feminajacob09@oksbi";

export const QR_CODE_IMAGE = "/assets/payment-qr.png";

export const FEE_BY_REGISTRATION_TYPE: Record<RegistrationType, number> = {
  Internal: 200,
  External: 250,
};

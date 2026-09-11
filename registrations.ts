import { FEE_BY_REGISTRATION_TYPE } from "../config/payment";
import type {
  CollegeDetails,
  FoodPreference,
  Participant,
  PersonalDetails,
  SelectedEvent,
  TeamMemberLite,
} from "../types";

interface CreateRegistrationPayload extends PersonalDetails, CollegeDetails {
  selectedEvents: SelectedEvent[];
  isTeamRegistration: boolean;
  teamName?: string;
  teamSize?: number;
  teamMembers: TeamMemberLite[];
  foodPreference?: FoodPreference;
  esportsGame?: string;
  transactionId: string;
  paymentScreenshot: string; // base64 data URI — required in this flow
  paymentAmountCheck: "MATCHED"; // only ever submitted once the light OCR check passes
}

/**
 * NOTE — no backend is connected right now.
 *
 * The old Google Sheets / Google Apps Script webhook integration has been
 * removed on purpose (a new database will be connected later). Until then,
 * these functions keep the exact same signatures and return shapes the rest
 * of the app already expects — they build the same Participant record and
 * resolve successfully locally, without sending it anywhere — so the
 * Registration → Payment → Success flow keeps working exactly as it looks
 * today. Nothing submitted here is actually persisted anywhere yet.
 *
 * To wire up a real backend: replace the body of submitRegistration and
 * submitFeedback with calls to your new API, keeping their parameter and
 * return types the same so nothing else in the app needs to change.
 */

const REGISTRATION_ID_COUNTER_KEY = "elvarix26_registration_id_counter";

/**
 * Generates "ELVA1", "ELVA2", "ELVA3", ... via a counter kept in
 * localStorage (not sessionStorage, so it survives across tabs/sessions on
 * this device/browser).
 *
 * IMPORTANT LIMITATION: with no backend connected, this counter is scoped
 * to one browser on one device — it cannot hand out a single globally
 * sequential number across every visitor. Two people registering from two
 * different devices can both be issued "ELVA7", for instance. Once a real
 * backend is connected, move this counter there (e.g. an atomic increment
 * in the database) so numbering is genuinely unique and sequential across
 * everyone — this local version is a best-effort stand-in until then.
 */
function nextRegistrationId(): string {
  try {
    const stored = localStorage.getItem(REGISTRATION_ID_COUNTER_KEY);
    const next = (stored ? parseInt(stored, 10) : 0) + 1;
    localStorage.setItem(REGISTRATION_ID_COUNTER_KEY, String(next));
    return `ELVA${next}`;
  } catch {
    // localStorage unavailable (private browsing, storage disabled, etc.) —
    // fall back to a still-unique, if non-sequential, ID rather than fail.
    return `ELVA${Date.now()}`;
  }
}

export async function submitRegistration(payload: CreateRegistrationPayload): Promise<Participant> {
  const now = new Date().toISOString();
  const registrationId = nextRegistrationId();

  const feePerPerson = FEE_BY_REGISTRATION_TYPE[payload.registrationType!];

  const body: Participant = {
    _id: registrationId,
    registrationId,
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    gender: payload.gender,
    registrationType: payload.registrationType!,
    collegeName: payload.collegeName,
    department: payload.department,
    year: payload.year,
    selectedEvents: payload.selectedEvents.map((e) => ({
      eventName: e.eventName,
      eventCategory: e.eventCategory,
      eventTime: e.eventTime,
      eventVenue: e.eventVenue,
    })),
    isTeamRegistration: payload.isTeamRegistration,
    teamName: payload.teamName,
    teamSize: payload.teamSize,
    teamMembers: payload.teamMembers,
    foodPreference: payload.foodPreference,
    esportsGame: payload.esportsGame,
    transactionId: payload.transactionId,
    paymentScreenshot: payload.paymentScreenshot,
    paymentAmountCheck: payload.paymentAmountCheck,
    amountPerParticipant: feePerPerson,
    totalAmount: feePerPerson * (payload.isTeamRegistration ? payload.teamSize || 1 : 1),
    paymentStatus: "PAID",
    registrationStatus: "CONFIRMED",
    status: "confirmed",
    createdAt: now,
    updatedAt: now,
  };

  // No backend connected yet — resolve locally with the built record so the
  // rest of the app (Success page, etc.) behaves exactly as it does today.
  return body;
}

/**
 * Sends the participant's feedback to the configured recipients. There is
 * currently no email-sending backend connected (the previous Google Apps
 * Script integration, which used to send this via MailApp, was removed).
 *
 * This intentionally does NOT fake a success response — per the requirement
 * that feedback must actually be delivered, not just appear to succeed. It
 * throws a clear, honest error instead, which the Feedback form on the
 * Success page already surfaces with a retry option.
 *
 * To wire this up for real: connect a backend or email API here (it must
 * run server-side — never put an email provider's secret key in this
 * frontend code) and send an email containing the participant's name,
 * email, college name, selected event(s), feedback text, and a submission
 * timestamp to both feminajacob09@gmail.com and aj6169846@gmail.com.
 */
export async function submitFeedback(participant: Participant, feedback: string): Promise<void> {
  void participant;
  void feedback;
  throw new Error(
    "Feedback can't be sent right now — no email service is connected yet. Please try again later."
  );
}

export async function fetchRegistrationById(registrationId: string): Promise<Participant> {
  throw new Error(`Registration lookup is not available without a connected database: ${registrationId}`);
}

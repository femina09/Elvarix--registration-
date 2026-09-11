import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useRegistration } from "../../context/RegistrationContext";
import { submitFeedback } from "../../api/registrations";

export default function SuccessStep() {
  const { result, resetRegistration } = useRegistration();
  const [feedback, setFeedback] = useState("");
  const [feedbackState, setFeedbackState] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [feedbackError, setFeedbackError] = useState("");

  if (!result) {
    return <Navigate to="/register" replace />;
  }

  const handlePrint = () => window.print();

  const handleFeedbackSubmit = async () => {
    const trimmedFeedback = feedback.trim();
    if (!trimmedFeedback || feedbackState === "submitting" || feedbackState === "submitted") return;

    setFeedbackState("submitting");
    setFeedbackError("");
    try {
      await submitFeedback(result, trimmedFeedback);
      setFeedbackState("submitted");
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : "Couldn't submit feedback. Please try again.");
      setFeedbackState("error");
    }
  };

  const handleDownload = () => {
    const content = `ELVARIX'26 — REGISTRATION CONFIRMATION
========================================
Registration ID     : ${result.registrationId}
${
  result.isTeamRegistration
    ? `Team Name            : ${result.teamName}
Team Members         : ${result.teamMembers.map((m) => m.name).join(", ")}`
    : `Participant           : ${result.fullName}`
}
Selected Event(s)    : ${result.selectedEvents.map((e) => e.eventName).join(", ")}
${result.esportsGame ? `E-Sports Game        : ${result.esportsGame}\n` : ""}Registration Type    : ${result.registrationType}
Total Amount         : ₹${result.totalAmount}
Transaction ID       : ${result.transactionId}
Payment Status       : PAID
Registered On        : ${new Date(result.createdAt).toLocaleString("en-IN")}
========================================
See you on September 23, 2026!`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.registrationId}-confirmation.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 bg-gold/10">
        <span className="font-display text-2xl text-gold">✓</span>
      </div>

      <h1 className="mt-6 font-display text-3xl text-parchment">Thank You for Registering!</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted">
        Your registration has been successfully submitted. We're excited to see you at ELVARIX'26!
      </p>
      <p className="mt-1 font-display text-base text-gold">See you on September 23, 2026.</p>

      <div className="mt-8 w-full rounded-sm border border-copper/30 bg-coffee/40 p-8 text-left">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-copper-light">Registration ID</p>
        <p className="mt-1 font-mono text-2xl text-gold">{result.registrationId}</p>

        <div className="mt-6 space-y-2 border-t border-white/10 pt-6 text-sm">
          {result.isTeamRegistration ? (
            <>
              <div className="flex justify-between">
                <span className="text-muted">Team Name</span>
                <span className="text-parchment">{result.teamName}</span>
              </div>
              <div>
                <span className="text-muted">Team Members</span>
                <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-parchment">
                  {result.teamMembers.map((m, i) => (
                    <li key={i}>{m.name}</li>
                  ))}
                </ol>
              </div>
            </>
          ) : (
            <div className="flex justify-between">
              <span className="text-muted">Participant</span>
              <span className="text-parchment">{result.fullName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted">Selected Event{result.selectedEvents.length > 1 ? "s" : ""}</span>
            <span className="text-right text-parchment">
              {result.selectedEvents.map((e) => e.eventName).join(", ")}
            </span>
          </div>
          {result.esportsGame && (
            <div className="flex justify-between">
              <span className="text-muted">E-Sports Game</span>
              <span className="text-parchment">{result.esportsGame}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted">Registration Type</span>
            <span className="text-parchment">{result.registrationType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Total Amount</span>
            <span className="text-parchment">₹{result.totalAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Transaction ID</span>
            <span className="text-parchment">{result.transactionId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Registration Date</span>
            <span className="text-parchment">{new Date(result.createdAt).toLocaleDateString("en-IN")}</span>
          </div>
        </div>

        <div className="mt-6 rounded-sm border border-gold/30 bg-gold/5 p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">Payment Status</p>
          <p className="mt-1 font-mono text-sm text-parchment">PAID</p>
        </div>
      </div>

      <div className="mt-8 w-full rounded-sm border border-copper/20 bg-coffee/30 p-6 text-left">
        <label htmlFor="feedback" className="font-mono text-[10px] uppercase tracking-[0.2em] text-copper-light">
          Short Feedback <span className="text-muted">(optional)</span>
        </label>
        <textarea
          id="feedback"
          value={feedback}
          onChange={(event) => setFeedback(event.target.value.slice(0, 500))}
          disabled={feedbackState === "submitting" || feedbackState === "submitted"}
          maxLength={500}
          rows={3}
          placeholder="How was your registration experience?"
          className="mt-3 w-full resize-none rounded-sm border border-white/10 bg-black/30 px-4 py-3 text-sm text-parchment placeholder:text-muted/50 focus:border-gold focus:outline-none disabled:opacity-60"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs text-muted">{feedback.length}/500</span>
          {feedbackState === "submitted" ? (
            <span className="text-xs text-gold">Thank you for your feedback.</span>
          ) : (
            <button
              type="button"
              onClick={handleFeedbackSubmit}
              disabled={!feedback.trim() || feedbackState === "submitting"}
              className="rounded-sm bg-copper px-5 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-ink hover:bg-copper-light disabled:cursor-not-allowed disabled:opacity-40"
            >
              {feedbackState === "submitting" ? "Sending…" : "Send Feedback"}
            </button>
          )}
        </div>
        {feedbackError && <p className="mt-2 text-xs text-red-400">{feedbackError}</p>}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleDownload}
          className="rounded-sm bg-copper px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-ink hover:bg-copper-light"
        >
          Download Confirmation
        </button>
        <button
          onClick={handlePrint}
          className="rounded-sm border border-white/15 px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-parchment hover:border-gold hover:text-gold"
        >
          Print
        </button>
        <Link
          to="/"
          onClick={resetRegistration}
          className="rounded-sm border border-white/15 px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-parchment hover:border-gold hover:text-gold"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { useRegistration } from "../../context/RegistrationContext";
import { isTeamRegistration } from "../../utils/teamHelpers";
import { TextField, OptionGroupField } from "../../components/ui/FormField";
import type { FoodPreference } from "../../types";

const TEAM_SIZES = [1, 2, 3, 4];
const FOOD_OPTIONS: FoodPreference[] = ["Veg", "Non-Veg"];
const ESPORTS_GAME_OPTIONS = ["Free Fire / PUBG", "Football"];

export default function TeamStep() {
  const {
    selectedEvents,
    teamName,
    teamSize,
    teamMembers,
    foodPreference,
    esportsGame,
    setTeamName,
    setTeamSize,
    updateTeamMember,
    setFoodPreference,
    setEsportsGame,
  } = useRegistration();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const isTeamFlow = isTeamRegistration(selectedEvents);
  const hasEsports = selectedEvents.some((e) => e.eventName === "E-Sports");

  const handleContinue = (e?: FormEvent) => {
    e?.preventDefault();
    if (isTeamFlow) {
      if (!teamName.trim()) {
        setError("Team Name is required.");
        return;
      }
      for (let i = 0; i < teamSize; i++) {
        const m = teamMembers[i];
        if (!m?.name.trim()) {
          setError(`Enter a name for Team Member ${i + 1}.`);
          return;
        }
        if (!/^[6-9]\d{9}$/.test(m.phone.trim())) {
          setError(`Enter a valid 10-digit mobile number for Team Member ${i + 1}.`);
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email.trim())) {
          setError(`Enter a valid email address for Team Member ${i + 1}.`);
          return;
        }
        if (m.foodPreference !== "Veg" && m.foodPreference !== "Non-Veg") {
          setError(`Select a Food Preference for Team Member ${i + 1}.`);
          return;
        }
      }
    } else {
      if (foodPreference !== "Veg" && foodPreference !== "Non-Veg") {
        setError("Please select your Food Preference.");
        return;
      }
    }
    if (hasEsports && !esportsGame) {
      setError("Please select a Game for E-Sports.");
      return;
    }
    setError("");
    navigate("/register/payment");
  };

  const esportsGameField = hasEsports ? (
    <div className="rounded-sm border border-copper/20 bg-coffee/30 p-5">
      <OptionGroupField
        label="E-Sports — Select Game"
        required
        name="esports-game"
        value={esportsGame || ""}
        onChange={setEsportsGame}
        options={ESPORTS_GAME_OPTIONS.map((g) => ({ label: g, value: g }))}
      />
    </div>
  ) : null;

  if (!isTeamFlow) {
    // No team event selected — this registration is for a single participant.
    return (
      <div className="space-y-8">
        <div>
          <h2 className="font-display text-2xl text-parchment">Team</h2>
          <p className="mt-1 text-sm text-muted">Participation Type</p>
        </div>

        <div className="flex items-center gap-4 rounded-sm border border-gold/40 bg-gold/10 p-5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold bg-gold text-ink">
            <Check size={14} strokeWidth={3} />
          </span>
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.15em] text-gold">One Participant</p>
            <p className="mt-1 text-xs text-muted">
              This registration is for a single participant — no team members needed.
            </p>
          </div>
        </div>

        {esportsGameField}

        <div className="rounded-sm border border-copper/20 bg-coffee/30 p-5">
          <OptionGroupField
            label="Food Preference"
            required
            name="solo-food-preference"
            value={foodPreference || ""}
            onChange={(value) => setFoodPreference(value as FoodPreference)}
            options={FOOD_OPTIONS.map((o) => ({ label: o, value: o }))}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => navigate("/register/events")}
            className="rounded-sm border border-white/10 px-8 py-3 font-mono text-xs uppercase tracking-[0.2em] text-muted hover:text-parchment"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => handleContinue()}
            className="rounded-sm bg-copper px-8 py-3 font-mono text-xs uppercase tracking-[0.2em] text-ink hover:bg-copper-light"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleContinue} noValidate className="space-y-8">
      <div>
        <h2 className="font-display text-2xl text-parchment">Team Details</h2>
        <p className="mt-1 text-sm text-muted">
          Your selected event is a team event. Create your team below — one combined payment
          covers the whole team.
        </p>
      </div>

      <TextField label="Team Name" required value={teamName} onChange={(e) => setTeamName(e.target.value)} />

      <div>
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
          Number of Team Members <span className="text-copper-light">*</span>
        </span>
        <div className="mt-2 flex gap-2">
          {TEAM_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setTeamSize(size)}
              className={`flex h-12 w-12 items-center justify-center rounded-sm border font-mono text-sm transition-colors ${
                teamSize === size
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-white/10 text-muted hover:border-copper/40 hover:text-parchment"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-muted">Minimum 1, maximum 4 members.</p>
      </div>

      {esportsGameField}

      <div className="space-y-4">
        {Array.from({ length: teamSize }).map((_, i) => (
          <div key={i} className="rounded-sm border border-copper/20 bg-coffee/30 p-5">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-copper-light">
              Team Member {i + 1}
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField
                label="Name"
                required
                value={teamMembers[i]?.name || ""}
                onChange={(e) => updateTeamMember(i, { name: e.target.value })}
              />
              <TextField
                label="Phone Number"
                required
                inputMode="numeric"
                type="tel"
                autoComplete="tel"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                value={teamMembers[i]?.phone || ""}
                onChange={(e) => updateTeamMember(i, { phone: e.target.value.replace(/\D/g, "") })}
              />
              <TextField
                label="Email ID"
                type="email"
                required
                autoComplete="email"
                value={teamMembers[i]?.email || ""}
                onChange={(e) => updateTeamMember(i, { email: e.target.value })}
              />
            </div>

            <div className="mt-4">
              <OptionGroupField
                label="Food Preference"
                required
                name={`food-preference-${i}`}
                value={teamMembers[i]?.foodPreference || ""}
                onChange={(value) => updateTeamMember(i, { foodPreference: value as FoodPreference })}
                options={FOOD_OPTIONS.map((o) => ({ label: o, value: o }))}
              />
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={() => navigate("/register/events")}
          className="rounded-sm border border-white/10 px-8 py-3 font-mono text-xs uppercase tracking-[0.2em] text-muted hover:text-parchment"
        >
          Back
        </button>
        <button
          type="submit"
          className="rounded-sm bg-copper px-8 py-3 font-mono text-xs uppercase tracking-[0.2em] text-ink hover:bg-copper-light"
        >
          Continue
        </button>
      </div>
    </form>
  );
}

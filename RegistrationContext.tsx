import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type {
  CollegeDetails,
  FoodPreference,
  Participant,
  PersonalDetails,
  RegistrationType,
  SelectedEvent,
  TeamMemberLite,
} from "../types";

const STORAGE_KEY = "elvarix26_registration_draft";

interface RegistrationState {
  registrationType: RegistrationType | null;
  personal: PersonalDetails;
  college: CollegeDetails;
  selectedEvents: SelectedEvent[];
  teamName: string;
  teamSize: number;
  teamMembers: TeamMemberLite[];
  // Food preference for a solo (non-team) registration only — team
  // registrations use each teamMembers[].foodPreference instead.
  foodPreference: FoodPreference | null;
  // Which game the participant/team is playing for E-Sports — only relevant
  // when E-Sports is among selectedEvents.
  esportsGame: string | null;
  result: Participant | null;
  preselectEventId: string | null;
}

const emptyPersonal: PersonalDetails = { fullName: "", email: "", phone: "", gender: "" };
const emptyCollege: CollegeDetails = {
  registrationType: null,
  collegeName: "",
  department: "",
  year: "",
};

const emptyMember: TeamMemberLite = { name: "", phone: "", email: "" };

const initialState: RegistrationState = {
  registrationType: null,
  personal: emptyPersonal,
  college: emptyCollege,
  selectedEvents: [],
  teamName: "",
  teamSize: 1,
  teamMembers: [{ ...emptyMember }],
  foodPreference: null,
  esportsGame: null,
  result: null,
  preselectEventId: null,
};

interface RegistrationContextValue extends RegistrationState {
  setRegistrationType: (type: RegistrationType) => void;
  setPersonal: (details: PersonalDetails) => void;
  setCollege: (details: CollegeDetails) => void;
  toggleEvent: (event: SelectedEvent) => void;
  selectSingleEvent: (event: SelectedEvent) => void;
  setTeamName: (name: string) => void;
  setTeamSize: (size: number) => void;
  updateTeamMember: (index: number, updates: Partial<TeamMemberLite>) => void;
  setFoodPreference: (pref: FoodPreference) => void;
  setEsportsGame: (game: string) => void;
  setResult: (participant: Participant) => void;
  setPreselectEventId: (eventId: string | null) => void;
  resetRegistration: () => void;
}

const RegistrationContext = createContext<RegistrationContextValue | undefined>(undefined);

// Only the Payment page is allowed to resume a previous draft on a fresh
// page load (reload, reopening a background tab, returning from a UPI app
// switch that killed the tab, etc.) — every earlier step must always start
// clean from the Home page on a genuinely fresh load. This check runs only
// once, at the moment RegistrationProvider first mounts for this page load
// — normal in-app navigation between steps never re-runs it, since the
// provider isn't remounted by client-side route changes.
const RESUMABLE_PATH = "/register/payment";

function loadDraft(): RegistrationState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;

    if (window.location.pathname !== RESUMABLE_PATH) {
      sessionStorage.removeItem(STORAGE_KEY);
      return initialState;
    }

    const parsed = JSON.parse(raw);
    // Guard against a draft saved by an older version of this site with a
    // different shape — fall back to a clean slate for any field that
    // doesn't look right, rather than letting bad cached data crash a
    // later render.
    const selectedEvents = Array.isArray(parsed?.selectedEvents) ? parsed.selectedEvents : [];
    const teamMembers = Array.isArray(parsed?.teamMembers) && parsed.teamMembers.length > 0
      ? parsed.teamMembers
      : [{ ...emptyMember }];
    return {
      ...initialState,
      ...parsed,
      selectedEvents,
      teamMembers,
      result: null,
    };
  } catch {
    return initialState;
  }
}

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RegistrationState>(loadDraft);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setRegistrationType = (type: RegistrationType) => {
    setState((s) => ({
      ...s,
      registrationType: type,
      college: {
        ...s.college,
        registrationType: type,
        collegeName: type === "Internal" ? "Grace College of Engineering" : "",
      },
    }));
  };

  const setPersonal = (details: PersonalDetails) => setState((s) => ({ ...s, personal: details }));
  const setCollege = (details: CollegeDetails) => setState((s) => ({ ...s, college: details }));

  // ELVARIX'26 allows at most one Technical event and one Non-Technical
  // event per registration. Selecting an event already chosen deselects it;
  // selecting a new event in a category replaces any existing selection in
  // that same category (selections in the other category are untouched).
  const toggleEvent = (event: SelectedEvent) => {
    setState((s) => {
      const exists = s.selectedEvents.find((e) => e.eventId === event.eventId);
      if (exists) {
        return { ...s, selectedEvents: s.selectedEvents.filter((e) => e.eventId !== event.eventId) };
      }
      const withoutSameCategory = s.selectedEvents.filter((e) => e.eventCategory !== event.eventCategory);
      return { ...s, selectedEvents: [...withoutSameCategory, { ...event }] };
    });
  };

  // Kept for the "Register Now" preselect-from-elsewhere flow, which still
  // wants a single, unambiguous event selected rather than adding to a list.
  const selectSingleEvent = (event: SelectedEvent) => {
    setState((s) => ({ ...s, selectedEvents: [{ ...event }] }));
  };

  const setTeamName = (name: string) => setState((s) => ({ ...s, teamName: name }));

  // Resizes the members array to match the chosen team size (1-4), padding
  // with blank members or trimming extras — never losing data for members
  // that are still within the new size.
  const setTeamSize = (size: number) =>
    setState((s) => {
      const next = [...s.teamMembers];
      while (next.length < size) next.push({ ...emptyMember });
      next.length = size;
      return { ...s, teamSize: size, teamMembers: next };
    });

  const updateTeamMember = (index: number, updates: Partial<TeamMemberLite>) =>
    setState((s) => ({
      ...s,
      teamMembers: s.teamMembers.map((m, i) => (i === index ? { ...m, ...updates } : m)),
    }));

  const setFoodPreference = (pref: FoodPreference) => setState((s) => ({ ...s, foodPreference: pref }));
  const setEsportsGame = (game: string) => setState((s) => ({ ...s, esportsGame: game }));

  const setResult = (participant: Participant) => setState((s) => ({ ...s, result: participant }));
  const setPreselectEventId = (eventId: string | null) => setState((s) => ({ ...s, preselectEventId: eventId }));

  const resetRegistration = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setState(initialState);
  };

  return (
    <RegistrationContext.Provider
      value={{
        ...state,
        setRegistrationType,
        setPersonal,
        setCollege,
        toggleEvent,
        selectSingleEvent,
        setTeamName,
        setTeamSize,
        updateTeamMember,
        setFoodPreference,
        setEsportsGame,
        setResult,
        setPreselectEventId,
        resetRegistration,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const ctx = useContext(RegistrationContext);
  if (!ctx) throw new Error("useRegistration must be used within RegistrationProvider");
  return ctx;
}

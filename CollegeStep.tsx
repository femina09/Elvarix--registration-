import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useRegistration } from "../../context/RegistrationContext";
import { TextField, OptionGroupField } from "../../components/ui/FormField";

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export default function CollegeStep() {
  const { college, setCollege, registrationType } = useRegistration();
  const navigate = useNavigate();
  const [form, setForm] = useState(college);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isInternal = registrationType === "Internal";

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.collegeName.trim()) next.collegeName = "College name is required.";
    if (!form.department.trim()) next.department = "Department is required.";
    if (!form.year) next.year = "Year of study is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setCollege(form);
    navigate("/register/events");
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <h2 className="font-display text-2xl text-parchment">College Details</h2>

      <TextField
        label="College Name"
        required
        disabled={isInternal}
        value={form.collegeName}
        onChange={(e) => setForm({ ...form, collegeName: e.target.value })}
        error={errors.collegeName}
        placeholder={isInternal ? undefined : "Your college name"}
      />
      <TextField
        label="Department"
        required
        value={form.department}
        onChange={(e) => setForm({ ...form, department: e.target.value })}
        error={errors.department}
        placeholder="e.g. Computer Science Engineering"
      />
      <OptionGroupField
        label="Year of Study"
        required
        name="year"
        value={form.year}
        onChange={(value) => setForm({ ...form, year: value })}
        options={YEARS.map((y) => ({ label: y, value: y }))}
        error={errors.year}
      />

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={() => navigate("/register/personal")}
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

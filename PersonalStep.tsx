import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useRegistration } from "../../context/RegistrationContext";
import { TextField, OptionGroupField } from "../../components/ui/FormField";

export default function PersonalStep() {
  const { personal, setPersonal } = useRegistration();
  const navigate = useNavigate();
  const [form, setForm] = useState(personal);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) next.phone = "Enter a valid 10-digit mobile number starting with 6-9.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setPersonal(form);
    navigate("/register/college");
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <h2 className="font-display text-2xl text-parchment">Personal Details</h2>

      <TextField
        label="Full Name"
        required
        value={form.fullName}
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        error={errors.fullName}
        placeholder="As per college ID"
      />
      <TextField
        label="Email Address"
        type="email"
        required
        autoComplete="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={errors.email}
        placeholder="you@example.com"
      />
      <TextField
        label="Mobile Number"
        required
        inputMode="numeric"
        type="tel"
        autoComplete="tel"
        pattern="[6-9][0-9]{9}"
        maxLength={10}
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
        error={errors.phone}
        placeholder="10-digit number"
      />
      <OptionGroupField
        label="Gender (optional)"
        name="gender"
        value={form.gender}
        onChange={(value) => setForm({ ...form, gender: value })}
        options={[
          { label: "Male", value: "Male" },
          { label: "Female", value: "Female" },
          { label: "Other", value: "Other" },
          { label: "Prefer not to say", value: "Prefer not to say" },
        ]}
      />

      <div className="flex justify-end pt-4">
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

"use client";

import { useState } from "react";
import { profile } from "@/data/profile";

// The brief.
//
// Same rule as the rest of the page: the apparatus is brutal and nothing
// is softened. Fields are a label and a rule — no boxes, no rounded
// corners, no placeholder text pretending to be a value, no floating
// labels. The budget options are hard rectangles that invert when chosen,
// because a selected state should be unmistakable rather than tinted. The
// only colour is the site's one accent, and it is spent on two things: the
// marks that say a field is required, and the rule under the field you are
// typing in.
//
// WHERE THIS SENDS. There is no backend on this site and I will not invent
// one. With `ENDPOINT` left null the form composes the message into the
// studio's own mail client and hands it over — which works today, with
// nothing to set up, and is honest about what it is. It is also the weaker
// option for winning work: a visitor on webmail with no mail client
// configured will hit a dead end, and some clients truncate a long body.
// Set `ENDPOINT` to a form service's URL (Formspree, Basin, a Next route
// handler — anything that takes a POST) and the form posts instead, with
// no other change needed.
const ENDPOINT: string | null = null;

// The ranges came from the reference the studio sent, not from me — a
// price ladder is a business decision and not mine to invent. They are
// here so the field is real; change the numbers to the studio's own.
const BUDGETS = ["5k – 10k", "10k – 20k", "More"];

type State = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [budget, setBudget] = useState<string | null>(null);
  const [state, setState] = useState<State>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (!name || !email || !message) return;

    if (!ENDPOINT) {
      const subject = `Project enquiry — ${name}`;
      const body = [
        `Name: ${name}`,
        `Email: ${email}`,
        budget ? `Budget (USD): ${budget}` : "Budget (USD): not given",
        "",
        message,
      ].join("\n");
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(body)}`;
      setState("sent");
      return;
    }

    setState("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email, message, budget }),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setBudget(null);
      setState("sent");
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <Field label="Your name" name="name" autoComplete="name" />
      <Field label="Your email" name="email" type="email" autoComplete="email" />
      <Field label="Your message" name="message" multiline />

      <fieldset className="mt-10 border-t border-line pt-5">
        <legend className="sr-only">Your budget in US dollars</legend>
        <span
          className="mb-4 block text-[0.625rem] uppercase tracking-[0.26em] text-paper-dim"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Your budget (USD)
        </span>
        {/* w-fit, or the hairline background that draws the dividers runs
            on past the last option and reads as a fourth, empty choice. */}
        <div className="flex w-fit flex-wrap gap-px bg-line-strong">
          {BUDGETS.map((b) => {
            const on = budget === b;
            return (
              <button
                key={b}
                type="button"
                aria-pressed={on}
                onClick={() => setBudget(on ? null : b)}
                className="px-5 py-3 text-[0.625rem] uppercase tracking-[0.22em] transition-colors duration-200"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: on ? "var(--color-paper)" : "var(--color-ink)",
                  color: on ? "var(--color-ink)" : "var(--color-paper-dim)",
                }}
              >
                {b}
              </button>
            );
          })}
        </div>
        {/* Deliberately not required. A visitor who does not yet know their
            budget is still a visitor worth hearing from, and a mandatory
            price field at the top of a first conversation loses more work
            than it qualifies. */}
      </fieldset>

      <button
        type="submit"
        disabled={state === "sending"}
        data-cursor="view"
        data-cursor-note="D&B / BRIEF"
        className="mt-10 w-full border border-paper bg-paper px-8 py-5 text-[0.6875rem] uppercase tracking-[0.3em] text-ink transition-colors duration-200 hover:bg-transparent hover:text-paper disabled:opacity-50 md:w-auto"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {state === "sending" ? "Sending…" : "Send the brief"}
      </button>

      {/* One live region, so a screen reader is told what happened. */}
      <p
        role="status"
        aria-live="polite"
        className="mt-5 min-h-[1.25rem] text-[0.625rem] uppercase tracking-[0.22em]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {state === "sent" ? (
          <span className="text-paper">
            {ENDPOINT ? "Received — thank you." : "Handed to your mail app."}
          </span>
        ) : null}
        {state === "error" ? (
          <span className="text-[color:var(--color-accent)]">
            Did not send. Write to {profile.email}.
          </span>
        ) : null}
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  multiline = false,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  multiline?: boolean;
  autoComplete?: string;
}) {
  const id = `f-${name}`;
  const shared =
    "mt-3 w-full border-0 border-b border-line bg-transparent pb-3 text-lg text-paper outline-none transition-colors duration-200 focus:border-[color:var(--color-accent)] md:text-xl";

  return (
    <div className="mt-10 first:mt-0">
      <label
        htmlFor={id}
        className="block text-[0.625rem] uppercase tracking-[0.26em] text-paper-dim"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
        <span aria-hidden className="pl-1 text-[color:var(--color-accent)]">
          *
        </span>
        <span className="sr-only"> (required)</span>
      </label>
      {multiline ? (
        <textarea id={id} name={name} required rows={4} className={`${shared} resize-none`} />
      ) : (
        <input id={id} name={name} type={type} required autoComplete={autoComplete} className={shared} />
      )}
    </div>
  );
}

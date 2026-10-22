"use client";
import { useState } from "react";
const fields = [
  {
    id: "powiedziec",
    label: "Co chcę powiedzieć?",
    hint: "Nawet jedno zdanie, np. „Ostatnio jest mi ciężko”.",
  },
  {
    id: "sprawa",
    label: "Co teraz utrudnia mi dzień?",
    hint: "Tylko to, o czym na ten moment chcesz porozmawiać.",
  },
  {
    id: "pytania",
    label: "O co chcę zapytać?",
    hint: "Możesz zapisać pytania o kontakt, dostępne wsparcie lub kolejny krok.",
  },
  {
    id: "dalej",
    label: "Co ustaliliśmy? Jaki jest następny krok?",
    hint: "To miejsce możesz uzupełnić po rozmowie.",
  },
];
export function ConversationSheet() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  return (
    <section className="conversation-sheet">
      <p className="privacy-note">
        Te notatki zostają w tej karcie przeglądarki. Nie wysyłamy ich na serwer
        ani nie zapisujemy po zamknięciu strony.
      </p>
      {fields.map((field) => (
        <div className="sheet-field" key={field.id}>
          <label htmlFor={field.id}>{field.label}</label>
          <span className="sheet-hint" id={field.id + "-hint"}>
            {field.hint}
          </span>
          <textarea
            id={field.id}
            rows={4}
            aria-describedby={field.id + "-hint"}
            value={answers[field.id] || ""}
            onChange={(e) =>
              setAnswers({ ...answers, [field.id]: e.target.value })
            }
          />
          <div className="print-answer">{answers[field.id] || "\n\n\n"}</div>
        </div>
      ))}
      <div className="sheet-actions">
        <button
          type="button"
          className="button dark"
          onClick={() => window.print()}
        >
          Wydrukuj lub zapisz jako PDF ↗
        </button>
        <button
          type="button"
          className="text-link"
          onClick={() => {
            if (window.confirm("Wyczyścić wpisane notatki?")) setAnswers({});
          }}
        >
          Wyczyść notatki
        </button>
      </div>
      <p className="sheet-reminder">
        Nie musisz wpisywać nazwiska, numeru PESEL ani szczegółów, których nie
        chcesz udostępniać.
      </p>
    </section>
  );
}

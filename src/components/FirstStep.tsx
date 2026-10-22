"use client";
import { useState } from "react";
const choices = [
  {
    id: "ja",
    title: "Szukam czegoś dla siebie",
    description: "Jest mi trudno albo chcę lepiej zrozumieć swoją sytuację.",
  },
  {
    id: "bliska",
    title: "Martwię się o bliską osobę",
    description: "Chcę pomóc, ale nie wiem, od czego zacząć.",
  },
  {
    id: "miasto",
    title: "Szukam miejsca w Sosnowcu",
    description: "Chcę znaleźć kontakt do instytucji albo działu.",
  },
];
export function FirstStep() {
  const [selected, setSelected] = useState("");
  return (
    <section className="first-step" aria-label="Wybierz pierwszy krok">
      <div className="step-choices">
        {choices.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className={selected === c.id ? "active" : ""}
            aria-label={c.title}
            aria-pressed={selected === c.id}
            onClick={() => setSelected(c.id)}
          >
            <span className="eyebrow">0{i + 1}</span>
            <strong>{c.title}</strong>
            <span>{c.description}</span>
            <span aria-hidden="true">↘</span>
          </button>
        ))}
      </div>
      {selected && (
        <div
          className="step-answer"
          role="region"
          aria-live="polite"
          aria-label="Propozycja pierwszego kroku"
        >
          {selected === "ja" && (
            <>
              <h2>Nie musisz wiedzieć wszystkiego od razu.</h2>
              <p>
                Możesz poczytać o sytuacjach podobnych do Twojej albo zacząć od
                zapisania pytań.
              </p>
              <a href="/blog?kategoria=kiedy-jest-trudno">
                Kiedy jest trudno ↗
              </a>
              <a href="/wsparcie/zdrowie-psychiczne">Zdrowie psychiczne ↗</a>
              <a href="/wsparcie/onkologia">W chorobie nowotworowej ↗</a>
            </>
          )}
          {selected === "bliska" && (
            <>
              <h2>Najpierw zapytaj, co byłoby pomocne.</h2>
              <p>
                Możesz zaproponować wysłuchanie, wspólne znalezienie kontaktu
                lub towarzyszenie podczas rozmowy. Nie musisz mieć gotowego
                rozwiązania.
              </p>
              <a href="/blog?kategoria=rodzina-i-dzieci">Rodzina i bliscy ↗</a>
              <a href="/wsparcie/zdrowie-psychiczne">O zdrowiu psychicznym ↗</a>
              <a href="/moja-kartka">Przygotuj pytania ↗</a>
            </>
          )}
          {selected === "miasto" && (
            <>
              <h2>Wybierz miejsce do swojej sprawy.</h2>
              <p>
                W MOPS są różne działy. Na stronie znajdziesz także inne
                instytucje i teksty dotyczące Sosnowca.
              </p>
              <a href="/sosnowiec?zakladka=mops">MOPS i działy ↗</a>
              <a href="/sosnowiec?zakladka=instytucje">Inne instytucje ↗</a>
              <a href="/sosnowiec?zakladka=artykuly">Artykuły z Sosnowca ↗</a>
            </>
          )}
        </div>
      )}
    </section>
  );
}

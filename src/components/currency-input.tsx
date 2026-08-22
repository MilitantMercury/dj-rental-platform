"use client";

import { useState, type FocusEvent, type InputHTMLAttributes } from "react";
import { euroToCents, formatEuroInput } from "@/lib/quote-pricing";

type CurrencyInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "onBlur" | "onChange" | "value"
> & {
  initialCents: number;
};

export function CurrencyInput({ initialCents, ...props }: CurrencyInputProps) {
  const [value, setValue] = useState(() => formatEuroInput(initialCents));

  const selectValue = (event: FocusEvent<HTMLInputElement>) => {
    event.currentTarget.select();
  };

  const normalizeValue = () => {
    const cents = euroToCents(value);
    if (cents !== null) setValue(formatEuroInput(cents));
  };

  return (
    <input
      {...props}
      inputMode="decimal"
      value={value}
      onFocus={selectValue}
      onChange={(event) => setValue(event.currentTarget.value)}
      onBlur={normalizeValue}
    />
  );
}

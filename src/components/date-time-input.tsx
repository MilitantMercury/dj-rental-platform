"use client";

import type { InputHTMLAttributes, MouseEvent } from "react";

type DateTimeInputProps = InputHTMLAttributes<HTMLInputElement>;

export function DateTimeInput(props: DateTimeInputProps) {
  const openPicker = (event: MouseEvent<HTMLInputElement>) => {
    props.onClick?.(event);
    if (event.defaultPrevented) return;

    const input = event.currentTarget as HTMLInputElement & {
      showPicker?: () => void;
    };

    try {
      input.showPicker?.();
    } catch {
      // Il browser può gestire il controllo nativo senza esporre showPicker.
    }
  };

  return <input {...props} type="datetime-local" onClick={openPicker} />;
}

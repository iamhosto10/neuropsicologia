"use client";
import { useCallback, useEffect, useState } from "react";

// Preferencia de sonido compartida por todos los juegos (un niño sensible al ruido no tiene que
// silenciar cada juego otra vez). Misma firma que useState: [valor, setValor].
const KEY = "neuroplay:sound-enabled";

export function readSoundPref(storage: Pick<Storage, "getItem"> | undefined): boolean {
  try {
    return storage?.getItem(KEY) !== "0"; // por defecto activado
  } catch {
    return true;
  }
}
export function writeSoundPref(storage: Pick<Storage, "setItem"> | undefined, enabled: boolean) {
  try {
    storage?.setItem(KEY, enabled ? "1" : "0");
  } catch {
    /* modo privado: se ignora */
  }
}

export function useSoundPreference(): [boolean, (v: boolean | ((p: boolean) => boolean)) => void] {
  const [enabled, setEnabledState] = useState(true);
  // Se lee después de hidratar para no romper el HTML del servidor
  useEffect(() => {
    const stored = readSoundPref(typeof window === "undefined" ? undefined : window.localStorage);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabledState(stored);
  }, []);
  const setEnabled = useCallback((v: boolean | ((p: boolean) => boolean)) => {
    setEnabledState((prev) => {
      const next = typeof v === "function" ? v(prev) : v;
      writeSoundPref(typeof window === "undefined" ? undefined : window.localStorage, next);
      return next;
    });
  }, []);
  return [enabled, setEnabled];
}

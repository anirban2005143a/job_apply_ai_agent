"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { showToast } from "../lib/showToast";

type ResumeItem = { id: string; name: string; size: number };

type OnboardingState = {
  resumes: ResumeItem[];
  userData: any;
  constraints?: any;
  userPreference?: any;
};

type ContextValue = OnboardingState & {
  addResumes: (files: File[] | FileList) => void;
  removeResume: (id: string) => void;
  setUserData: (data: any) => void;
  setResumes: (r: ResumeItem[]) => void;
  setConstraints: (c: any) => void;
  setUserPreference: (c: any) => void;
  // Ensure resumes are processed (calls dummy API when there are new files)
  ensureResumesProcessed: () => Promise<{ processed: boolean; userData?: any }>;
};

const defaultState: OnboardingState = {
  resumes: [],
  userData: null,
  constraints: undefined,
  userPreference: undefined,
};

const OnboardingContext = createContext<ContextValue | undefined>(undefined);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [resumes, setResumesState] = useState<ResumeItem[]>(
    defaultState.resumes,
  );
  const [userData, setUserDataState] = useState<any>(defaultState.userData);
  const [processing, setProcessing] = useState<boolean>(false);
  const [constraints, setConstraintsState] = useState<any>(undefined);
  const [userPreference, setUserPreferenceState] = useState<any>(undefined);

  // Keep actual File objects in a ref (not serialized to localStorage)
  const resumeFilesRef = React.useRef<Record<string, File | null>>({});

  // load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("onboardingState");
      if (raw) {
        const parsed = JSON.parse(raw);
        setResumesState([]);
        // sanitize loaded userData to remove auto-empty items
        if (parsed.userData) {
          try {
            // lazy-import helper from lib to avoid circular issues
            const {
              removeEmptyItemsRecursively,
            } = require("../lib/updatePriorities");
            setUserDataState(removeEmptyItemsRecursively(parsed.userData));
          } catch (e) {
            setUserDataState(parsed.userData || null);
          }
        } else {
          setUserDataState(parsed.userData || null);
        }
        setConstraintsState(parsed.constraints || undefined);
        // Load legacy constraints into userPreference if present, otherwise prefer explicit userPreference
        setUserPreferenceState(parsed.userPreference || parsed.constraints || undefined);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    const payload = { resumes, userData, constraints, userPreference };
    localStorage.setItem("onboardingState", JSON.stringify(payload));
  }, [resumes, userData, constraints, userPreference]);

  // Notify other parts of the UI immediately when resumes change (so header can enable Details)
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("onboarding:resumes-changed", {
        detail: { count: resumes?.length },
      }),
    );
  }, [resumes]);

  async function ensureResumesProcessed(): Promise<{
    processed: boolean;
    userData?: any;
  }> {
    if (processing) return { processed: false };
    if (resumes?.length === 0) return { processed: false };
    setProcessing(true);

    try {
      // Build FormData with all current resume files
      const form = new FormData();
      const filesToSend: string[] = [];
      if (resumes) {
        for (const r of resumes) {
          const f = resumeFilesRef.current[r.id];
          if (f) {
            form.append("files", f, f.name);
            filesToSend.push(r.id);
          }
        }
      }

      if (filesToSend.length === 0) {
        console.warn("No file objects found for current resumes");
        return { processed: false };
      }

      const parserUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/parse-resumes`;
      const res = await fetch(parserUrl, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        showToast("Error processing resumes: " + text, 0);
        return { processed: false };
      }

      const json = await res.json();

      // If API returned user data, sanitize and persist it
      let newUserData: any = undefined;
      if (json && json.user) {
        try {
          const {
            removeEmptyItemsRecursively,
            applyPrioritiesRecursively,
          } = require("../lib/updatePriorities");
          function stripIds(obj: any): any {
            if (Array.isArray(obj)) return obj.map((v) => stripIds(v));
            if (obj && typeof obj === "object") {
              const out: any = {};
              for (const k of Object.keys(obj)) {
                if (k === "id") continue;
                out[k] = stripIds(obj[k]);
              }
              return out;
            }
            return obj;
          }

          const cleaned = removeEmptyItemsRecursively(stripIds(json.user));
          newUserData = applyPrioritiesRecursively(cleaned);
          setUserDataState(newUserData);

          // notify others
          window.dispatchEvent(
            new CustomEvent("onboarding:user-data-updated", { detail: {} }),
          );
          showToast("Resume processed — profile loaded", 1);
        } catch (e) {
          console.error("Error sanitizing user data:", e);
        }
      }

      console.log({ processed: true, userData: newUserData });

      // We intentionally do not delete stored file objects so future parses include all resumes
      return { processed: true, userData: newUserData };
    } catch (e) {
      console.error("Error processing resumes:", e);
      showToast("Error processing resumes: " + (e as any)?.message, 0);
      return { processed: false };
    } finally {
      setProcessing(false);
    }
  }

  function addResumes(files: File[] | FileList) {
    const arr = Array.from(files as File[]);
    const items = arr.map((f) => {
      const id = `${Date.now()}-${Math.random()}`;
      // store actual File object in ref (not persisted)
      resumeFilesRef.current[id] = f;
      return { id, name: f.name, size: f.size };
    });
    setResumesState((s) => {
      if (s) return [...s, ...items];
      return [...items];
    });

    // Trigger parsing of all resumes in the background when new files are added
    // (we send all current resumes per spec — no processed tracking)
    void (async () => {
      try {
        await ensureResumesProcessed();
      } catch (e) {
        console.error("Background resume processing failed:", e);
      }
    })();
  }

  function removeResume(id: string) {
    setResumesState((s) => s.filter((r) => r.id !== id));
    // remove stored file if present
    if (resumeFilesRef.current[id]) delete resumeFilesRef.current[id];
  }

  return (
    <OnboardingContext.Provider
      value={{
        resumes,
        userData,
        constraints,
        userPreference,
        addResumes,
        removeResume,
        setUserData: setUserDataState,
        setResumes: setResumesState,
        setConstraints: setConstraintsState,
        setUserPreference: setUserPreferenceState,
        ensureResumesProcessed,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx)
    throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}

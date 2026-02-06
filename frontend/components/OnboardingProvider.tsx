"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { showToast } from "../lib/showToast";
import { removeEmptyItemsRecursively, applyPrioritiesRecursively } from "@/lib/updatePriorities";

type ResumeItem = { id: string; name: string; size: number };

type OnboardingState = {
  resumes: ResumeItem[];
  userData: any;
  userPreference?: any;
};

type ContextValue = OnboardingState & {
  addResumes: (files: File[] | FileList) => void;
  removeResume: (id: string) => void;
  setUserData: (data: any) => void;
  setResumes: (r: ResumeItem[]) => void;
  setUserPreference: (c: any) => void;
  // Ensure resumes are processed (calls dummy API when there are new files)
  ensureResumesProcessed: () => Promise<{ processed: boolean; userData?: any }>;
};

const defaultState: OnboardingState = {
  resumes: [],
  userData: null,
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
  const [userPreference, setUserPreferenceState] = useState<any>(undefined);

  // Keep actual File objects in a ref (not serialized to sessionStorage)
  const resumeFilesRef = React.useRef<Record<string, File | null>>({});

  // load from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("onboardingState");
      console.log("raw" , raw)
      if (raw) {
        const parsed = JSON.parse(raw);
        console.log(parsed)
        // setResumesState([]);
        // sanitize loaded userData to remove auto-empty items
        if (parsed.userData) {
          try {
            setUserDataState(removeEmptyItemsRecursively(parsed.userData));
          } catch (e) {
            setUserDataState(parsed.userData || -1);
          }
        } else {
          setUserDataState(parsed.userData || -1);
        }
        // Load legacy constraints into userPreference if present, otherwise prefer explicit userPreference
        setUserPreferenceState(parsed.userPreference || parsed.constraints || undefined);
      }
    } catch (e) {
      // ignore
      setUserDataState(null)
      setUserPreferenceState(null)
    }
  }, []);

  useEffect(() => {
    try {
      function stripInternal(o: any): any {
        if (Array.isArray(o)) return o.map((v) => stripInternal(v));
        if (o && typeof o === "object") {
          const out: any = {};
          for (const k of Object.keys(o)) {
            if (k.startsWith("_")) continue;
            out[k] = stripInternal(o[k]);
          }
          return out;
        }
        return o;
      }

      const payload = {
        userData: userData ? removeEmptyItemsRecursively(stripInternal(userData)) : userData,
        userPreference: userPreference ? removeEmptyItemsRecursively(stripInternal(userPreference)) : userPreference,
      };
      console.log("payload" , payload)
      sessionStorage.setItem("onboardingState", JSON.stringify(payload));
    } catch (err) {
      console.warn("Failed to save onboardingState", err);
    }
  }, [resumes, userData, userPreference]);

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
        const data = await res.json();
        showToast("Error processing resumes: " + data.detail, 0);
        return { processed: false };
      }

      const json = await res.json();

      // If API returned user data, sanitize and persist it
      let newUserData: any = undefined;
      if (json && json.user) {
        try {
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
        userPreference,
        addResumes,
        removeResume,
        setUserData: setUserDataState,
        setResumes: setResumesState,
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

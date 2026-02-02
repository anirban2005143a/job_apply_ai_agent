"use client";
// Add global type for window.__onboardingUserData
declare global {
  interface Window {
    __onboardingUserData?: any;
  }
}

import React from "react";
import ArrayListEditor from "./ArrayListEditor";
import Section from "./Section";

function isScalar(value: any) {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  );
}

function prettifyLabel(key: string) {
  const parts = key.split(".");
  const last = parts[parts.length - 1];
  const label = last.replace(/_/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

import { removeEmptyItemsRecursively } from "../lib/updatePriorities";

export default function EditableJsonForm({
  data,
  onChange,
}: {
  data: any;
  onChange: (d: any | ((prev: any) => any)) => void;
}) {
  // stable setter for a top-level key
  const setField = React.useCallback(
    (key: string, value: any) => {
      const updated = { ...(data || {}), [key]: value };
      onChange(removeEmptyItemsRecursively(updated));
    },
    [onChange, data],
  );

  // Default templates for recommended sections when missing
  const defaultTemplates: Record<string, any> = {
    projects: {
      name: "",
      description: "",
      technologies: [],
      github_url: "",
      deployed_project_url: "",
    },
    skills: { name: "" },
    experience: {
      company: "",
      role: "",
      dates: "",
      location: null,
      responsibilities: "",
    },
    education: { institution: "", degree: "", year: "" },
    achievements: { description: null, link: null },
    social_engagements: { organization: null, role: null, description: null },
  };

  // Stateless memoized scalar input (renders input or textarea for summary)
  const ScalarInput = React.useCallback(
    React.memo(function ScalarInput({
      label,
      value,
      isSummary,
      onValue,
    }: {
      label: string;
      value: any;
      isSummary?: boolean;
      onValue: (v: any) => void;
    }) {
      if (isSummary) {
        return (
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {label}
            </label>

            <textarea
              className="
      w-full min-h-[120px] resize-y
      rounded-lg
      border border-zinc-300 dark:border-zinc-700
      bg-white dark:bg-zinc-950
      px-3 py-2
      text-sm
      text-zinc-900 dark:text-zinc-100
      placeholder:text-zinc-400 dark:placeholder:text-zinc-500
      outline-none
      transition-all duration-150
      hover:border-zinc-400 dark:hover:border-zinc-600
      focus:border-primary
      focus:ring-1 focus:ring-primary/30
    "
              placeholder={label}
              value={value ?? ""}
              onChange={(e) => onValue(e.target.value)}
            />
          </div>
        );
      }
      return (
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {label}
          </label>

          <input
            className="
            w-full
            rounded-lg
            border border-zinc-300 dark:border-zinc-700
            bg-white dark:bg-zinc-950
            px-3 py-2
            text-sm
            text-zinc-900 dark:text-zinc-100
            placeholder:text-zinc-400 dark:placeholder:text-zinc-500
            outline-none
            transition-all duration-150
            hover:border-zinc-400 dark:hover:border-zinc-600
            focus:border-primary
            focus:ring-1 focus:ring-primary/30
          "
            placeholder={label}
            value={value ?? ""}
            onChange={(e) => onValue(e.target.value)}
          />
        </div>
      );
    }),
    [],
  );

  function renderField(key: string, value: any) {
    const label = prettifyLabel(key);

    // Hide internal fields like id/priority from being rendered in the form
    const parts = key.split(".");
    const lastKey = parts[parts.length - 1];
    if (lastKey === "id" || lastKey === "priority") return null;

    if (isScalar(value)) {
      // render summary as a multiline textarea with min/max height
      if (lastKey === "summary") {
        return (
          <div key={key}>
            <ScalarInput
              label={label}
              value={value}
              isSummary
              onValue={(v: any) => setField(key, v)}
            />
          </div>
        );
      }

      return (
        <div key={key}>
          <ScalarInput
            label={label}
            value={value}
            onValue={(v: any) => setField(key, v)}
          />
        </div>
      );
    }

    if (Array.isArray(value)) {
      const isSkills = key === "skills" || key.endsWith(".skills");
      const parts = key.split(".");
      const lastKey = parts[parts.length - 1];

      const emptyMessages: Record<string, string> = {
        skills: "No skills yet. Click Add item to add a skill.",
        projects: "No projects yet. Click Add item to add a project.",
        experience:
          "No experience entries yet. Click Add item to add experience.",
        education: "No education records yet. Click Add item to add education.",
        achievements:
          "No achievements yet. Click Add item to add an achievement.",
        social_engagements:
          "No social engagements yet. Click Add item to add one.",
      };

      const emptyMessage = emptyMessages[lastKey] ? (
        <span>{emptyMessages[lastKey]}</span>
      ) : undefined;

      return (
        <Section key={key} title={label}>
          {isSkills ? (
            <div className="grid grid-cols-1 gap-4">
              <ArrayListEditor
                value={value}
                onChange={(newArr) => setField(key, newArr)}
                itemClassName="p-2"
                emptyMessage={emptyMessage}
                template={defaultTemplates[lastKey]}
                itemRenderer={(item, idx, onItemChange) => (
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Skill
                    </div>

                    <input
                      className="
                w-full rounded-lg
                border border-zinc-300 dark:border-zinc-700
                bg-white dark:bg-zinc-950
                px-3 py-2 text-sm
                text-zinc-900 dark:text-zinc-100
                outline-none
                transition-all
                hover:border-zinc-400 dark:hover:border-zinc-600
                focus:border-zinc-500
                focus:ring-1 focus:ring-zinc-800/30
              "
                      placeholder="e.g. React, Python, SQL"
                      value={(item && item.name) ?? ""}
                      onChange={(e) =>
                        onItemChange({
                          ...(item || {}),
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              />
            </div>
          ) : (
            <ArrayListEditor
              value={value}
              onChange={(newArr) => setField(key, newArr)}
              emptyMessage={emptyMessage}
              template={defaultTemplates[lastKey]}
              itemRenderer={(item, idx, onItemChange) => {
                if (typeof item === "string") {
                  return (
                    <input
                      className="
                w-full rounded-lg
                border border-zinc-300 dark:border-zinc-700
                bg-white dark:bg-zinc-950
                px-3 py-2 text-sm
                text-zinc-900 dark:text-zinc-100
                outline-none
                transition-all
                hover:border-zinc-400 dark:hover:border-zinc-600
                focus:border-zinc-500
                focus:ring-1 focus:ring-zinc-900/30
              "
                      value={item}
                      onChange={(e) => onItemChange(e.target.value)}
                    />
                  );
                }

                return (
                  <div className="space-y-3">
                    {Object.keys(item)
                      .filter((k) => k !== "id" && k !== "priority")
                      .map((k) => (
                        <div key={k} className="flex items-center gap-4">
                          <div className="w-32 text-sm text-zinc-600 dark:text-zinc-400">
                            {prettifyLabel(k)}
                          </div>

                          <input
                            className="
                      w-full rounded-lg
                      border border-zinc-300 dark:border-zinc-700
                      bg-white dark:bg-zinc-950
                      px-3 py-2 text-sm
                      text-zinc-900 dark:text-zinc-100
                      outline-none
                      transition-all
                      hover:border-zinc-400 dark:hover:border-zinc-600
                      focus:border-zinc-500
                      focus:ring-1 focus:ring-zinc-900/30
                    "
                            value={item[k] ?? ""}
                            onChange={(e) =>
                              onItemChange({ ...item, [k]: e.target.value })
                            }
                          />
                        </div>
                      ))}
                  </div>
                );
              }}
            />
          )}
        </Section>
      );
    }

    if (typeof value === "object") {
      return (
        <Section key={key} title={label}>
          <div className="space-y-2 pl-4 border-l">
            {Object.keys(value).map((k) => (
              <ScalarInput
                key={k}
                label={prettifyLabel(k)}
                value={value[k]}
                onValue={(v: any) =>
                  setField(key, { ...(value || {}), [k]: v })
                }
              />
            ))}
          </div>
        </Section>
      );
    }

    return null;
  }

  // Personal fields we surface in a top profile card
  const personalKeys = [
    "full_name",
    "email",
    "phone",
    "linkedin_url",
    "github_url",
    "portfolio_url",
  ];

  // Always render certain array sections at the end so users can add items even if missing
  const alwaysRenderArrayKeys = [
    "projects",
    "skills",
    "experience",
    "education",
    "achievements",
    "social_engagements",
  ];
  const presentKeys = Object.keys(data || {});
  const missingKeys = alwaysRenderArrayKeys.filter(
    (k) => !presentKeys.includes(k),
  );
  let fieldsToRender = [...presentKeys, ...missingKeys];

  // Remove personal keys from the generic list (we render them separately)
  fieldsToRender = fieldsToRender.filter((k) => !personalKeys.includes(k));

  function renderPersonalCard() {
    return (
      // <div className="profile-card mb-6 flex gap-8 items-start">
      //   <div className="profile-avatar" aria-hidden>
      //     {((data && data.full_name) || "")
      //       .split(" ")
      //       .map((s: string) => s[0] ?? "")
      //       .slice(0, 2)
      //       .join("") || "U"}
      //   </div>
      //   <div className="flex-1">
      //     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      //       <div>
      //         <label className="form-label">Full name</label>
      //         <input
      //           className="form-control input-focus w-full"
      //           value={data?.full_name ?? ""}
      //           onChange={(e) => setField("full_name", e.target.value)}
      //         />
      //       </div>
      //       <div>
      //         <label className="form-label">Email</label>
      //         <input
      //           className="form-control input-focus w-full"
      //           value={data?.email ?? ""}
      //           onChange={(e) => setField("email", e.target.value)}
      //         />
      //       </div>
      //       <div>
      //         <label className="form-label">Phone</label>
      //         <input
      //           className="form-control input-focus w-full"
      //           value={data?.phone ?? ""}
      //           onChange={(e) => setField("phone", e.target.value)}
      //         />
      //       </div>
      //       <div>
      //         <label className="form-label">Portfolio</label>
      //         <input
      //           className="form-control input-focus w-full"
      //           value={data?.portfolio_url ?? ""}
      //           onChange={(e) => setField("portfolio_url", e.target.value)}
      //         />
      //       </div>
      //       <div>
      //         <label className="form-label">LinkedIn</label>
      //         <input
      //           className="form-control input-focus w-full"
      //           value={data?.linkedin_url ?? ""}
      //           onChange={(e) => setField("linkedin_url", e.target.value)}
      //         />
      //       </div>
      //       <div>
      //         <label className="form-label">GitHub</label>
      //         <input
      //           className="form-control input-focus w-full"
      //           value={data?.github_url ?? ""}
      //           onChange={(e) => setField("github_url", e.target.value)}
      //         />
      //       </div>
      //     </div>
      //     <div>
      //       <label className="form-label">Summary</label>
      //       <textarea
      //         className="form-control input-focus w-full min-h-30 resize-y"
      //         value={data?.summary ?? ""}
      //         onChange={(e) => setField("summary", e.target.value)}
      //       />
      //     </div>
      //   </div>
      // </div>

      <div
        className="
    mb-8 flex gap-6 items-start
    rounded-2xl
    border border-zinc-200 dark:border-zinc-800
    bg-gradient-to-br from-white to-zinc-50
    dark:from-zinc-900 dark:to-zinc-950
    p-6
    shadow-sm
  "
      >
        {/* Avatar */}
        <div
      className="
        flex h-16 w-16 shrink-0 items-center justify-center
        rounded-full
        bg-gradient-to-br from-blue-300 via-blue-500 to-blue-600
        text-lg font-semibold text-white
        shadow-md
      "

          aria-hidden
        >
          {((data && data.full_name) || "")
            .split(" ")
            .map((s: string) => s[0] ?? "")
            .slice(0, 2)
            .join("") || "U"}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {[
              ["Full name", "full_name"],
              ["Email", "email"],
              ["Phone", "phone"],
              ["Portfolio", "portfolio_url"],
              ["LinkedIn", "linkedin_url"],
              ["GitHub", "github_url"],
            ].map(([label, key]) => (
              <div key={key}>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {label}
                </label>
                <input
                  className="
              w-full rounded-lg
              border border-zinc-300 dark:border-zinc-700
              bg-white dark:bg-zinc-950
              px-3 py-2 text-sm
              text-zinc-900 dark:text-zinc-100
              placeholder:text-zinc-400
              outline-none
              transition-all
              hover:border-zinc-400 dark:hover:border-zinc-600
              focus:border-primary
              focus:ring-1 focus:ring-primary/30
            "
                  value={(data as any)?.[key] ?? ""}
                  onChange={(e) => setField(key as any, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Summary
            </label>
            <textarea
              className="
          w-full min-h-[120px] resize-y
          rounded-lg
          border border-zinc-300 dark:border-zinc-700
          bg-white dark:bg-zinc-950
          px-3 py-2 text-sm
          text-zinc-900 dark:text-zinc-100
          outline-none
          transition-all
          hover:border-zinc-400 dark:hover:border-zinc-600
          focus:border-primary
          focus:ring-1 focus:ring-primary/30
        "
              value={data?.summary ?? ""}
              onChange={(e) => setField("summary", e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {renderPersonalCard()}

      <div className="space-y-8">
        {fieldsToRender.map((k) =>
          k === "summary" ? null : (
            <div key={k} className="">
              {renderField(k, (data && data[k]) ?? [])}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

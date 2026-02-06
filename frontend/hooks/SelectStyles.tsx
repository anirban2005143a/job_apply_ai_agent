"use client"

import { StylesConfig } from "react-select";

export const getSelectStyles = (isDark: boolean): StylesConfig => ({
  control: (base, state) => ({
    ...base,
    backgroundColor: isDark ? "#09090b" : "#ffffff",
    borderColor: state.isFocused
      ? "#6366f1"
      : isDark
      ? "#27272a"
      : "#cbd5e1",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#6366f1",
    },
  }),

  menu: (base) => ({
    ...base,
    backgroundColor: isDark ? "#09090b" : "#ffffff",
    color: isDark ? "#e5e7eb" : "#0f172a",
  }),

  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#6366f1"
      : state.isFocused
      ? isDark
        ? "#1e1b4b"
        : "#e0e7ff"
      : "transparent",
    color: state.isSelected
      ? "#ffffff"
      : isDark
      ? "#e5e7eb"
      : "#0f172a",
    cursor: "pointer",
  }),

  singleValue: (base) => ({
    ...base,
    color: isDark ? "#e5e7eb" : "#0f172a",
  }),

  placeholder: (base) => ({
    ...base,
    color: isDark ? "#a1a1aa" : "#64748b",
  }),
});

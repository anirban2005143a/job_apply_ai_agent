"use client";
import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/OnboardingProvider";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import makeAnimated from "react-select/animated";
import { countries } from "./locationOptions";
import cities from "cities-list";
import debounce from "lodash.debounce";
import ArrayListEditor from "@/components/ArrayListEditor";

const workModes = [
  { value: "Remote", label: "Remote" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "Onsite", label: "Onsite" },
];
const companyTypes = [
  { value: "Large", label: "Large" },
  { value: "Startup", label: "Startup" },
  { value: "Tech", label: "Tech" },
  { value: "Other", label: "Other" },
];

const noticeOptions = [
  { value: "immediately", label: "Immediately" },
  { value: "2_weeks", label: "2 weeks" },
  { value: "1_month", label: "1 month" },
  { value: "3_months", label: "3 months" },
  { value: "specific_date", label: "Specific date" },
];
const relocationOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "negotiable", label: "Negotiable" },
];
const employmentStatusOptions = [
  { value: "actively_looking", label: "Actively looking" },
  { value: "open_to_offers", label: "Open to offers" },
  { value: "just_browsing", label: "Just browsing" },
];
const sponsorshipOptions = [
  { value: "no", label: "No" },
  { value: "yes_now", label: "Yes (now)" },
  { value: "yes_future", label: "Yes (future)" },
  { value: "maybe", label: "Maybe" },
];
const contractTypeOptions = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];
const managementLevelOptions = [
  { value: "ic", label: "Individual Contributor" },
  { value: "lead", label: "Lead" },
  { value: "manager", label: "Manager" },
  { value: "executive", label: "Executive" },
];
const currencyOptions = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "INR", label: "INR" },
];

const languageProficiencyOptions = [
  { value: "Native", label: "Native" },
  { value: "Fluent", label: "Fluent" },
  { value: "Professional", label: "Professional" },
  { value: "Conversational", label: "Conversational" },
  { value: "Beginner", label: "Beginner" },
];

const animatedComponents = makeAnimated();

export default function ConstraintsPage() {
  const router = useRouter();
  const { setConstraints, setUserPreference } = useOnboarding();

  // Memoize city and country lists
  const cityList = useMemo(() => Object.keys(cities), []);
  const defaultCityOptions = useMemo(
    () => cityList.slice(0, 20).map((city) => ({ value: city, label: city })),
    [cityList],
  );

  // Debounced city search
  const loadCityOptions = useCallback(
    debounce((inputValue: string, callback: (options: any[]) => void) => {
      if (!inputValue || inputValue.length < 2) {
        callback(defaultCityOptions);
        return;
      }
      const matches = cityList
        .filter((city) => city.toLowerCase().includes(inputValue.toLowerCase()))
        .slice(0, 30)
        .map((city) => ({ value: city, label: city }));
      callback(matches);
    }, 250),
    [cityList, defaultCityOptions],
  );

  const defaultCountryOptions = useMemo(() => countries.slice(0, 20), []);

  // Helper for comma-separated display in react-select multi
  const multiValueLabel = (options: any[]) =>
    options && options.length > 0 ? options.map((o) => o.label).join(", ") : "";

  const loadCountryOptions = useCallback(
    debounce((inputValue: string, callback: (options: any[]) => void) => {
      if (!inputValue || inputValue.length < 1) {
        callback(defaultCountryOptions);
        return;
      }
      const matches = countries
        .filter((c) => c.label.toLowerCase().includes(inputValue.toLowerCase()))
        .slice(0, 30);
      callback(matches);
    }, 250),
    [defaultCountryOptions],
  );

  // Memoize select styles to avoid recreation on every render
  const customSelectStyles = useMemo(
    () => ({
      control: (provided: any, state: any) => ({
        ...provided,
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        borderRadius: "0.5rem",
        boxShadow: state.isFocused
          ? "0 6px 18px rgba(14,165,164,0.08), 0 0 0 2px var(--primary)"
          : "none",
        minHeight: "44px",
        transition:
          "box-shadow 160ms ease, border-color 120ms ease, transform 120ms ease",
      }),
      menu: (provided: any) => ({
        ...provided,
        zIndex: 9999,
      }),
      option: (provided: any, state: any) => ({
        ...provided,
        backgroundColor: state.isFocused ? "var(--accent)" : "white",
        color: state.isFocused ? "white" : "var(--foreground)",
        cursor: "pointer",
      }),
      singleValue: (provided: any) => ({
        ...provided,
        color: "var(--foreground)",
      }),
      input: (provided: any) => ({
        ...provided,
        color: "var(--foreground)",
      }),
    }),
    [],
  );

  const [form, setForm] = useState<any>({
    // Availability & Logistics
    noticePeriod: "", // values: immediately, 2_weeks, 1_month, 3_months, specific_date
    startDate: "",
    relocationOpenness: "",
    employmentStatus: "",

    // Legal & Work Authorization
    hasVisa: "",
    visaType: "",
    visaCountries: [] as any[],
    workAuthorizationInCurrentCountry: "",
    sponsorshipRequirement: "",

    // Skill matching
    primaryLanguages: [] as any[], // array of { language: string, proficiency: string }
    roleExperience: [] as any[], // array of { role: string, years: string }

    // Preferences
    workMode: [] as any[],
    cityPreference: [] as any[],
    countryPreference: [] as any[],
    contractTypes: [] as any[],
    managementLevel: "",

    // company preferences
    companyPreference: "",
    blacklistedCompanies: "",

    // salary
    salaryFloor: "",
    salaryCurrency: "USD",

    companyType: null,
    industryPreference: "",

    // other
    yearsOfExperience: "",
    applicationsPerDay: "",
    minConfidence: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [onboardingUser, setonboardingUser] = useState({});

  const currentCountry =
    (onboardingUser as any)?.country ||
    (onboardingUser as any)?.location?.country;

  console.log(onboardingUser);
  // For react-select (single/multi value)
  // Some fields we prefer storing a simple string value (option.value) instead of the full option object
  const handleSelectChange = useCallback((name: string, option: unknown) => {
    const singleValueFields = new Set([
      "hasVisa",
      "noticePeriod",
      "relocationOpenness",
      "employmentStatus",
      "sponsorshipRequirement",
      "managementLevel",
      "salaryCurrency",
      "workAuthorizationInCurrentCountry",
    ]);

    if (singleValueFields.has(name)) {
      const value =
        typeof option === "string" ? option : ((option as any)?.value ?? "");
      setForm((f: any) => ({ ...f, [name]: value }));
    } else {
      setForm((f: any) => ({ ...f, [name]: option as any }));
    }
  }, []);

  // Cleanup debounced functions on unmount
  React.useEffect(() => {
    return () => {
      (loadCityOptions as any)?.cancel?.();
      (loadCountryOptions as any)?.cancel?.();
    };
  }, [loadCityOptions, loadCountryOptions]);

  // For text/number inputs
  const numericRules: Record<
    string,
    { min?: number; max?: number; integer?: boolean }
  > = {
    salaryFloor: { min: 0 },
    yearsOfExperience: { min: 0, integer: true },
    applicationsPerDay: { min: 1, integer: true },
    minConfidence: { min: 0, max: 100, integer: true },
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Numeric fields: allow only numeric-ish input, clamp to min/max, and prevent text
    if (numericRules[name]) {
      // Allow empty value (user clearing the field)
      if (value === "") {
        setForm((f: any) => ({ ...f, [name]: "" }));
        return;
      }

      // Reject input with non-numeric characters (allow one decimal point if not integer)
      const { integer } = numericRules[name];
      const regex = integer ? /^\d*$/ : /^\d*\.?\d*$/;
      if (!regex.test(value)) return; // ignore invalid keystrokes

      let numberValue = Number(value);
      if (isNaN(numberValue)) return;

      // Clamp
      const { min, max } = numericRules[name];
      if (typeof min === "number" && numberValue < min) numberValue = min;
      if (typeof max === "number" && numberValue > max) numberValue = max;

      // Store as string to keep controlled input stable
      setForm((f: any) => ({ ...f, [name]: String(numberValue) }));
      return;
    }

    setForm((f: any) => ({ ...f, [name]: value }));
  };

  // Prevent non-numeric keystrokes for number inputs; optionally allow decimal
  const handleNumericKeyDown =
    (allowDecimal = false) =>
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") {
        e.preventDefault();
      }
      if (!allowDecimal && e.key === ".") {
        e.preventDefault();
      }
    };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Persist constraints separately as userPreference so we don't mix it with parsed userData
    try {
      const current = JSON.parse(
        localStorage.getItem("onboardingState") || "{}",
      );
      // keep existing userData untouched
      current.userPreference = form;
      console.log(current);
      localStorage.setItem("onboardingState", JSON.stringify(current));
      console.log("Saved userPreference in onboardingState");
    } catch (err) {
      console.warn("Failed to save onboardingState", err);
    }

    // Update onboarding context with the new preferences
    if (typeof setUserPreference === "function") setUserPreference(form);
    // keep legacy hook available by also calling setConstraints for backward compatibility
    if (typeof setConstraints === "function") setConstraints(form);

    router.push("/onboarding/password");
  };

  useEffect(() => {
    setonboardingUser(
      JSON.parse(localStorage.getItem("onboardingState") || "{}").userData,
    );
  }, []);

  // Clear visa-related fields when user unselects visa
  useEffect(() => {
    if (
      form.hasVisa !== "yes" &&
      (form.visaType || (form.visaCountries && form.visaCountries.length > 0))
    ) {
      setForm((f: any) => ({ ...f, visaType: "", visaCountries: [] }));
    }
  }, [form.hasVisa]);

  return (
    <JobConstraintsForm
      form={form}
      setForm={setForm}
      handleChange={handleChange}
      handleSelectChange={handleSelectChange}
      handleSubmit={handleSubmit}
      handleNumericKeyDown={handleNumericKeyDown}
      countries={countries}
      noticeOptions={noticeOptions}
      relocationOptions={relocationOptions}
      employmentStatusOptions={employmentStatusOptions}
      languageProficiencyOptions={languageProficiencyOptions}
      workModes={workModes}
      loadCityOptions={async () => []}
      defaultCityOptions={[]}
      loadCountryOptions={async () => []}
      defaultCountryOptions={[]}
      currencyOptions={currencyOptions}
      companyTypes={companyTypes}
      contractTypeOptions={contractTypeOptions}
      managementLevelOptions={managementLevelOptions}
      sponsorshipOptions={sponsorshipOptions}
      currentCountry={currentCountry}
      submitting={false}
    />

  );
}

// Memoized multi-select input for primary languages
export const MemoizedLanguageSelect = memo(
  ({ value, onChange, languageOptions, proficiencyOptions, customSelectStyles }: any) => {
    const handleItemChange = (index: number, field: string, val: any) => {
      const newArr = [...value];
      newArr[index][field] = val;
      onChange(newArr);
    };

    return (
      <div className="space-y-2">
        {value.map((item: any, idx: number) => (
          <div key={idx} className="flex gap-2 items-center">
            <Select
              options={languageOptions}
              value={item.language}
              onChange={(val: any) => handleItemChange(idx, "language", val)}
              placeholder="Select language"
              styles={customSelectStyles}
              className="flex-1"
            />
            <Select
              options={proficiencyOptions}
              value={item.proficiency}
              onChange={(val: any) => handleItemChange(idx, "proficiency", val)}
              placeholder="Select proficiency"
              styles={customSelectStyles}
              className="flex-1"
            />
            <button
              type="button"
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              onClick={() => onChange(value.filter((_ : any, i:any) => i !== idx))}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="mt-1 px-4 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          onClick={() => onChange([...value, { language: null, proficiency: null }])}
        >
          Add Language
        </button>
      </div>
    );
  }
);

// Memoized role experience inputs
export const MemoizedRoleExperience = memo(({ value, onChange }: any) => {
  const handleItemChange = (index: number, field: string, val: any) => {
    const newArr = [...value];
    newArr[index][field] = val;
    onChange(newArr);
  };

  return (
    <div className="space-y-2">
      {value.map((item: any, idx: number) => (
        <div key={idx} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Role"
            value={item.role}
            onChange={(e) => handleItemChange(idx, "role", e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition"
          />
          <input
            type="number"
            min={0}
            placeholder="Years"
            value={item.years}
            onChange={(e) => handleItemChange(idx, "years", e.target.value)}
            className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition"
          />
          <button
            type="button"
            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            onClick={() => onChange(value.filter((_:any, i:any) => i !== idx))}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="mt-1 px-4 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        onClick={() => onChange([...value, { role: "", years: "" }])}
      >
        Add Experience
      </button>
    </div>
  );
});


const JobConstraintsForm = ({
  form,
  setForm,
  handleChange,
  handleSelectChange,
  handleSubmit,
  submitting,
  noticeOptions,
  relocationOptions,
  employmentStatusOptions,
  languageProficiencyOptions,
  workModes,
  loadCityOptions,
  defaultCityOptions,
  loadCountryOptions,
  defaultCountryOptions,
  currencyOptions,
  companyTypes,
  contractTypeOptions,
  managementLevelOptions,
  sponsorshipOptions,
  currentCountry,
}: any) => {
  const router = useRouter();

  const customSelectStyles = {
    control: (base: any) => ({
      ...base,
      borderColor: "rgb(209 213 219)",
      backgroundColor: "rgb(249 250 251)",
      minHeight: 38,
    }),
    menu: (base: any) => ({ ...base, zIndex: 9999 }),
  };

  const multiValueLabel = (values: any) => values.map((v: any) => v.label).join(", ");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-300">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-900 dark:text-gray-100">
          Job Search Constraints
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Visa Section */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
              Do you have a visa for other countries?
            </label>
            <Select
              name="hasVisa"
              classNamePrefix="react-select"
              options={[
                { value: "", label: "Select" },
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              components={animatedComponents}
              value={[
                { value: "", label: "Select" },
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ].find((opt) => opt.value === form.hasVisa) || { value: "", label: "Select" }}
              onChange={(option: any) => handleSelectChange("hasVisa", option)}
              placeholder="Select"
              isClearable={false}
              styles={customSelectStyles}
              menuPlacement="auto"
              menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
            />
          </div>

          {form.hasVisa === "yes" && (
            <>
              <div>
                <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                  Visa Type / Work Authorization
                </label>
                <input
                  name="visaType"
                  value={form.visaType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition"
                  placeholder="e.g. H1B, PR, etc."
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                  Visa Valid For Which Countries?
                </label>
                <Select
                  name="visaCountries"
                  classNamePrefix="react-select"
                  options={[]}
                  components={animatedComponents}
                  value={form.visaCountries}
                  onChange={(option: any) => handleSelectChange("visaCountries", option)}
                  isMulti
                  placeholder="Select countries..."
                  styles={customSelectStyles}
                  menuPlacement="auto"
                  menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
                />
              </div>
            </>
          )}

          {/* Availability & Logistics */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                Notice period / Start date
              </label>
              <Select
                name="noticePeriod"
                classNamePrefix="react-select"
                options={noticeOptions}
                components={animatedComponents}
                value={noticeOptions.find((o: any) => o.value === form.noticePeriod) || null}
                onChange={(opt: any) => handleSelectChange("noticePeriod", opt)}
                placeholder="How soon can you start?"
                isClearable
                styles={customSelectStyles}
                menuPlacement="auto"
                menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
              />
              {form.noticePeriod === "specific_date" && (
                <div className="mt-2">
                  <input
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                Relocation openness
              </label>
              <Select
                name="relocationOpenness"
                classNamePrefix="react-select"
                options={relocationOptions}
                components={animatedComponents}
                value={relocationOptions.find((o: any) => o.value === form.relocationOpenness) || null}
                onChange={(opt: any) => handleSelectChange("relocationOpenness", opt)}
                placeholder="Are you willing to relocate?"
                isClearable
                styles={customSelectStyles}
                menuPlacement="auto"
                menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                Current employment status
              </label>
              <Select
                name="employmentStatus"
                classNamePrefix="react-select"
                options={employmentStatusOptions}
                components={animatedComponents}
                value={employmentStatusOptions.find((o: any) => o.value === form.employmentStatus) || null}
                onChange={(opt: any) => handleSelectChange("employmentStatus", opt)}
                placeholder="Select status"
                isClearable
                styles={customSelectStyles}
                menuPlacement="auto"
                menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
              />
            </div>
          </div>

          {/* Legal & Work Authorization */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                Are you legally authorized to work {currentCountry ? `in ${currentCountry}` : "in your country"}?
              </label>
              <Select
                name="workAuthorizationInCurrentCountry"
                classNamePrefix="react-select"
                options={[
                  { value: "", label: "Select" },
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                components={animatedComponents}
                value={[{ value: "", label: "Select" }, { value: "yes", label: "Yes" }, { value: "no", label: "No" }].find(
                  (o) => o.value === form.workAuthorizationInCurrentCountry
                )}
                onChange={(opt: any) => handleSelectChange("workAuthorizationInCurrentCountry", opt)}
                placeholder="Select"
                isClearable={false}
                styles={customSelectStyles}
                menuPlacement="auto"
                menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                Sponsorship requirement
              </label>
              <Select
                name="sponsorshipRequirement"
                classNamePrefix="react-select"
                options={sponsorshipOptions}
                components={animatedComponents}
                value={sponsorshipOptions.find((o:any) => o.value === form.sponsorshipRequirement) || null}
                onChange={(opt: any) => handleSelectChange("sponsorshipRequirement", opt)}
                placeholder="Will you require sponsorship?"
                isClearable
                styles={customSelectStyles}
                menuPlacement="auto"
                menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
              Primary language proficiencies
            </label>
            <MemoizedLanguageSelect
              value={form.primaryLanguages}
              onChange={(v: any) => setForm((f: any) => ({ ...f, primaryLanguages: v }))}
              languageProficiencyOptions={languageProficiencyOptions}
              customSelectStyles={customSelectStyles}
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
              Total years of experience (by role)
            </label>
            <MemoizedRoleExperience
              value={form.roleExperience}
              onChange={(v: any) => setForm((f: any) => ({ ...f, roleExperience: v }))}
            />
          </div>

          {/* Preferred Work Mode */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
              Preferred Work Mode
            </label>
            <Select
              name="workMode"
              classNamePrefix="react-select"
              options={workModes}
              components={animatedComponents}
              value={form.workMode}
              onChange={(option: any) => handleSelectChange("workMode", option)}
              placeholder="Select work mode(s)..."
              isMulti
              closeMenuOnSelect={false}
              styles={customSelectStyles}
              menuPlacement="auto"
              menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
              formatOptionLabel={(option: any) => option.label}
            />
            {form.workMode && form.workMode.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Selected: {multiValueLabel(form.workMode)}
              </div>
            )}
          </div>

          {/* City & Country Preference */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                City Preference
              </label>
              <AsyncSelect
                name="cityPreference"
                classNamePrefix="react-select"
                value={form.cityPreference}
                onChange={(option: any) => handleSelectChange("cityPreference", option)}
                placeholder="Select or type city..."
                isClearable
                isMulti
                isSearchable
                loadOptions={loadCityOptions}
                defaultOptions={defaultCityOptions}
                styles={customSelectStyles}
                cacheOptions
                menuPlacement="auto"
                menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
                filterOption={null}
                isLoading={false}
              />
              {form.cityPreference && form.cityPreference.length > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Selected: {multiValueLabel(form.cityPreference)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                Country Preference
              </label>
              <AsyncSelect
                name="countryPreference"
                classNamePrefix="react-select"
                value={form.countryPreference}
                onChange={(option: any) => handleSelectChange("countryPreference", option)}
                isClearable
                isMulti
                isSearchable
                loadOptions={loadCountryOptions}
                defaultOptions={defaultCountryOptions}
                styles={customSelectStyles}
                cacheOptions
                menuPlacement="auto"
                menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
                filterOption={null}
                isLoading={false}
              />
              {form.countryPreference && form.countryPreference.length > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Selected: {multiValueLabel(form.countryPreference)}
                </div>
              )}
            </div>
          </div>

          {/* Company Preference */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
              Company Preference
            </label>
            <input
              name="companyPreference"
              value={form.companyPreference}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition"
              placeholder="Preferred companies (comma separated)"
              required
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 mt-6 justify-end">
            <button
              type="button"
              className="px-6 py-2 rounded-lg border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              onClick={() => router.push("/onboarding/details")}
              disabled={submitting}
            >
              Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition"
              disabled={submitting}
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
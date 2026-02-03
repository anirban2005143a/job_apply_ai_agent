"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  memo,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/OnboardingProvider";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import makeAnimated from "react-select/animated";
import { countries } from "./locationOptions";
import cities from "cities-list";
import { debounce } from "lodash";
import ISO6391 from "iso-639-1";
import { showToast } from "@/lib/showToast";
import { removeEmptyItemsRecursively } from "@/lib/updatePriorities";
import { ToastContainer } from "react-toastify";

const languageOptions = ISO6391.getAllNames().map((name) => ({
  value: name.toLowerCase(),
  label: name,
}));

const workModes = [
  { value: "Remote", label: "Remote" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "Onsite", label: "Onsite" },
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

const languageProficiencyOptions = [
  { value: "Native", label: "Native" },
  { value: "Fluent", label: "Fluent" },
  { value: "Professional", label: "Professional" },
  { value: "Conversational", label: "Conversational" },
  { value: "Beginner", label: "Beginner" },
];

const animatedComponents = makeAnimated();

/**
 * OPTIMIZATION: Debounced Input Component
 * Prevents the entire form from re-rendering on every single keystroke.
 */
const DebouncedInput = memo(
  ({
    name,
    value,
    onChange,
    placeholder,
    className,
    type = "text",
    required = false,
  }: any) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const debouncedChange = useRef(
      debounce((nextValue) => {
        onChange({ target: { name, value: nextValue } });
      }, 300),
    ).current;

    const handleLocalChange = (e: any) => {
      const val = e.target.value;
      setLocalValue(val);
      debouncedChange(val);
    };

    return (
      <input
        type="number"
        name={name}
        value={localValue}
        onChange={(e) => {
          if (type === "number" && Number(e.target.value) < 0) {
            showToast("Can not be negative", 0);
            return;
          }
          handleLocalChange(e);
        }}
        placeholder={placeholder}
        className={className}
        required={required}
      />
    );
  },
);

// Memoized multi-select input for primary languages
const MemoizedLanguageSelect = memo(
  ({
    value,
    onChange,
    languageOptions,
    proficiencyOptions,
    customSelectStyles,
  }: any) => {
    const handleItemChange = useCallback(
      (index: number, field: string, val: any) => {
        const newArr = [...value];
        newArr[index] = { ...newArr[index], [field]: val };
        onChange(newArr);
      },
      [value, onChange],
    );

    return (
      <div className="space-y-2">
        {value.map((item: any, idx: number) => (
          <div key={idx} className="flex gap-2 items-center">
            <Select
              options={languageOptions}
              isSearchable
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
              className="px-2 py-1 cursor-pointer bg-red-500 text-white rounded hover:bg-red-600 transition"
              onClick={() =>
                onChange(value.filter((_: any, i: any) => i !== idx))
              }
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="mt-1 px-4 cursor-pointer py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm text-gray-700 dark:text-gray-200"
          onClick={() =>
            onChange([...value, { language: null, proficiency: null }])
          }
        >
          + Add Language
        </button>
      </div>
    );
  },
);

// Memoized role experience inputs
const MemoizedRoleExperience = memo(({ value, onChange }: any) => {
  const handleItemChange = (index: number, field: string, val: any) => {
    const newArr = [...value];
    newArr[index] = { ...newArr[index], [field]: val };
    onChange(newArr);
  };

  return (
    <div className="space-y-2">
      {value.map((item: any, idx: number) => (
        <div key={idx} className="flex gap-2 items-center">
          <DebouncedInput
            placeholder="Role"
            value={item.role}
            onChange={(e: any) => handleItemChange(idx, "role", e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:ring-2 focus:ring-blue-500 transition outline-none"
          />
          <DebouncedInput
            type="number"
            placeholder="Years"
            value={item.years}
            onChange={(e: any) =>
              handleItemChange(idx, "years", e.target.value)
            }
            className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:ring-2 focus:ring-blue-500 transition outline-none"
          />
          <button
            type="button"
            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            onClick={() =>
              onChange(value.filter((_: any, i: any) => i !== idx))
            }
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="mt-1 px-4 py-1 cursor-pointer bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm text-gray-700 dark:text-gray-200"
        onClick={() => onChange([...value, { role: "", years: "" }])}
      >
        + Add Experience
      </button>
    </div>
  );
});

const JobConstraintsFormContent = memo(
  ({
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
    languageOptions,
    workModes,
    loadCityOptions,
    defaultCityOptions,
    loadCountryOptions,
    defaultCountryOptions,
    sponsorshipOptions,
    currentCountry,
  }: any) => {
    const router = useRouter();

    const customSelectStyles = useMemo(
      () => ({
        control: (base: any) => ({
          ...base,
          borderColor: "rgb(209 213 219)",
          backgroundColor: "rgb(249 250 251)",
          minHeight: 38,
        }),
        menu: (base: any) => ({ ...base, zIndex: 9999 }),
      }),
      [],
    );

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-colors duration-300 border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-extrabold mb-6 text-gray-900 dark:text-gray-100">
            User Preferences
          </h1>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Visa Section */}
            <div>
              <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                Do you have a visa for other countries?
              </label>
              <Select
                name="hasVisa"
                options={[
                  { value: "", label: "Select" },
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                components={animatedComponents}
                value={
                  [
                    { value: "", label: "Select" },
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ].find((opt) => opt.value === form.hasVisa) || {
                    value: "",
                    label: "Select",
                  }
                }
                onChange={(option: any) =>
                  handleSelectChange("hasVisa", option)
                }
                styles={customSelectStyles}
                menuPortalTarget={
                  typeof window !== "undefined" ? document.body : undefined
                }
              />
            </div>

            {form.hasVisa === "yes" && (
              <>
                <div>
                  <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                    Visa Type / Work Authorization
                  </label>
                  <DebouncedInput
                    name="visaType"
                    value={form.visaType}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="e.g. H1B, PR, etc."
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                    Visa Valid For Which Countries?
                  </label>
                  <AsyncSelect
                    name="visaCountries"
                    loadOptions={loadCountryOptions}
                    defaultOptions={defaultCountryOptions}
                    components={animatedComponents}
                    value={form.visaCountries}
                    onChange={(option: any) =>
                      handleSelectChange("visaCountries", option)
                    }
                    isMulti
                    cacheOptions
                    placeholder="Type to search countries..."
                    styles={customSelectStyles}
                    menuPortalTarget={
                      typeof window !== "undefined" ? document.body : undefined
                    }
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                  Notice period / Start date
                </label>
                <Select
                  name="noticePeriod"
                  options={noticeOptions}
                  components={animatedComponents}
                  value={
                    noticeOptions.find(
                      (o: any) => o.value === form.noticePeriod,
                    ) || null
                  }
                  onChange={(opt: any) =>
                    handleSelectChange("noticePeriod", opt)
                  }
                  placeholder="How soon can you start?"
                  isClearable
                  styles={customSelectStyles}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : undefined
                  }
                />
                {form.noticePeriod === "specific_date" && (
                  <div className="mt-2">
                    <DebouncedInput
                      name="startDate"
                      type="date"
                      value={form.startDate}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                  options={relocationOptions}
                  components={animatedComponents}
                  value={
                    relocationOptions.find(
                      (o: any) => o.value === form.relocationOpenness,
                    ) || null
                  }
                  onChange={(opt: any) =>
                    handleSelectChange("relocationOpenness", opt)
                  }
                  placeholder="Are you willing to relocate?"
                  isClearable
                  styles={customSelectStyles}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : undefined
                  }
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                  Current employment status
                </label>
                <Select
                  name="employmentStatus"
                  options={employmentStatusOptions}
                  components={animatedComponents}
                  value={
                    employmentStatusOptions.find(
                      (o: any) => o.value === form.employmentStatus,
                    ) || null
                  }
                  onChange={(opt: any) =>
                    handleSelectChange("employmentStatus", opt)
                  }
                  placeholder="Select status"
                  isClearable
                  styles={customSelectStyles}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : undefined
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                  Are you legally authorized to work{" "}
                  {currentCountry ? `in ${currentCountry}` : "in your country"}?
                </label>
                <Select
                  name="workAuthorizationInCurrentCountry"
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
                  ].find(
                    (o) => o.value === form.workAuthorizationInCurrentCountry,
                  )}
                  onChange={(opt: any) =>
                    handleSelectChange("workAuthorizationInCurrentCountry", opt)
                  }
                  styles={customSelectStyles}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : undefined
                  }
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                  Sponsorship requirement
                </label>
                <Select
                  name="sponsorshipRequirement"
                  options={sponsorshipOptions}
                  components={animatedComponents}
                  value={
                    sponsorshipOptions.find(
                      (o: any) => o.value === form.sponsorshipRequirement,
                    ) || null
                  }
                  onChange={(opt: any) =>
                    handleSelectChange("sponsorshipRequirement", opt)
                  }
                  placeholder="Will you require sponsorship?"
                  isClearable
                  styles={customSelectStyles}
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : undefined
                  }
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                Primary language proficiencies
              </label>
              <MemoizedLanguageSelect
                value={form.primaryLanguages}
                onChange={(v: any) =>
                  setForm((f: any) => ({ ...f, primaryLanguages: v }))
                }
                languageOptions={languageOptions}
                proficiencyOptions={languageProficiencyOptions}
                customSelectStyles={customSelectStyles}
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                Total years of experience (by role)
              </label>
              <MemoizedRoleExperience
                value={form.roleExperience}
                onChange={(v: any) =>
                  setForm((f: any) => ({ ...f, roleExperience: v }))
                }
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                Preferred Work Mode
              </label>
              <Select
                name="workMode"
                options={workModes}
                components={animatedComponents}
                value={form.workMode}
                onChange={(option: any) =>
                  handleSelectChange("workMode", option)
                }
                placeholder="Select work mode(s)..."
                isMulti
                closeMenuOnSelect={false}
                styles={customSelectStyles}
                menuPortalTarget={
                  typeof window !== "undefined" ? document.body : undefined
                }
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                  City Preference
                </label>
                <AsyncSelect
                  name="cityPreference"
                  value={form.cityPreference}
                  onChange={(option: any) =>
                    handleSelectChange("cityPreference", option)
                  }
                  placeholder="Select or type city..."
                  isClearable
                  isMulti
                  loadOptions={loadCityOptions}
                  defaultOptions={defaultCityOptions}
                  styles={customSelectStyles}
                  cacheOptions
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : undefined
                  }
                />
              </div>
              <div className="flex-1">
                <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                  Country Preference
                </label>
                <AsyncSelect
                  name="countryPreference"
                  value={form.countryPreference}
                  onChange={(option: any) =>
                    handleSelectChange("countryPreference", option)
                  }
                  isClearable
                  isMulti
                  loadOptions={loadCountryOptions}
                  defaultOptions={defaultCountryOptions}
                  styles={customSelectStyles}
                  cacheOptions
                  menuPortalTarget={
                    typeof window !== "undefined" ? document.body : undefined
                  }
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                Company Preference
              </label>
              <DebouncedInput
                name="companyPreference"
                value={form.companyPreference}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Preferred companies (comma separated)"
                required
              />
            </div>

            <div className="flex gap-4 mt-6 justify-end">
              <button
                type="button"
                className="px-6 py-2 cursor-pointer rounded-lg border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 transition"
                onClick={() => router.push("/onboarding/details")}
                disabled={submitting}
              >
                Back
              </button>
              <button
                type="submit"
                className="px-6 py-2 cursor-pointer rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                disabled={submitting}
              >
                Next
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  },
);

export default function PreferencesPage() {
  const router = useRouter();
  const { setUserPreference } = useOnboarding();
  const [onboardingUser, setonboardingUser] = useState<any>({});

  const [form, setForm] = useState<any>({
    noticePeriod: "",
    startDate: "",
    relocationOpenness: "",
    employmentStatus: "",
    hasVisa: "",
    visaType: "",
    visaCountries: [],
    workAuthorizationInCurrentCountry: "",
    sponsorshipRequirement: "",
    primaryLanguages: [],
    roleExperience: [],
    workMode: [],
    cityPreference: [],
    countryPreference: [],
    companyPreference: "",
  });

  const [submitting, setSubmitting] = useState(false);

  // Optimization: Memoize data structures
  const cityList = useMemo(() => Object.keys(cities), []);
  const defaultCityOptions = useMemo(
    () => cityList.slice(0, 20).map((city) => ({ value: city, label: city })),
    [cityList],
  );
  const defaultCountryOptions = useMemo(() => countries.slice(0, 20), []);

  // Optimization: Callback Stability
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
    }, 300),
    [cityList, defaultCityOptions],
  );

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
    }, 300),
    [defaultCountryOptions],
  );

  const handleSelectChange = useCallback((name: string, option: unknown) => {
    const singleValueFields = new Set([
      "hasVisa",
      "noticePeriod",
      "relocationOpenness",
      "employmentStatus",
      "sponsorshipRequirement",
      "workAuthorizationInCurrentCountry",
    ]);

    setForm((prev: any) => {
      if (singleValueFields.has(name)) {
        const value =
          typeof option === "string" ? option : ((option as any)?.value ?? "");
        return { ...prev, [name]: value };
      }
      return { ...prev, [name]: option };
    });
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitting(true);
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

        const cleaned = removeEmptyItemsRecursively(stripInternal(form));
        const current = JSON.parse(
          sessionStorage.getItem("onboardingState") || "{}",
        );
        current.userPreference = cleaned;
        sessionStorage.setItem("onboardingState", JSON.stringify(current));

        if (typeof setUserPreference === "function") setUserPreference(cleaned);

        router.push("/onboarding/password");
      } catch (err) {
        console.warn("Failed to save onboardingState", err);
      } finally {
        setSubmitting(false);
      }
    },
    [form, router, setUserPreference],
  );

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const state = JSON.parse(sessionStorage.getItem("onboardingState") || "{}");
      if (state.userData) setonboardingUser(state.userData);
      if (state.userPreference) {
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
        setForm(stripInternal(state.userPreference));
      }
    } catch (e:any) {
      showToast(e?.message || "Error occured. Please refresh the page.")
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="p-8">Loading preferences…</div>;
  }

  const currentCountry =
    onboardingUser?.country || onboardingUser?.location?.country;

  return (
    <>
      <ToastContainer />
      <JobConstraintsFormContent
        form={form}
        setForm={setForm}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        handleSubmit={handleSubmit}
        noticeOptions={noticeOptions}
        relocationOptions={relocationOptions}
        employmentStatusOptions={employmentStatusOptions}
        languageProficiencyOptions={languageProficiencyOptions}
        languageOptions={languageOptions}
        workModes={workModes}
        loadCityOptions={loadCityOptions}
        defaultCityOptions={defaultCityOptions}
        loadCountryOptions={loadCountryOptions}
        defaultCountryOptions={defaultCountryOptions}
        sponsorshipOptions={sponsorshipOptions}
        currentCountry={currentCountry}
        submitting={submitting}
      />
    </>
  );
}

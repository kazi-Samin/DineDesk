"use client";

import React, { useState, useRef, useEffect } from "react";

export interface Country {
  name: string;
  code: string; // ISO 2-letter (uppercase)
  dial: string; // e.g. "+880"
}

// Flag image from flagcdn.com — works on all platforms including Windows
function FlagImg({ code, size = 20 }: { code: string; size?: number }) {
  const src = `https://flagcdn.com/${size}x${Math.round(size * 0.75)}/${code.toLowerCase()}.png`;
  const src2x = `https://flagcdn.com/${size * 2}x${Math.round(size * 0.75 * 2)}/${code.toLowerCase()}.png`;
  return (
    <img
      src={src}
      srcSet={`${src2x} 2x`}
      width={size}
      height={Math.round(size * 0.75)}
      alt={code}
      className="rounded-sm object-cover shrink-0"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    />
  );
}

export const COUNTRIES: Country[] = [
  { name: "Afghanistan", code: "AF", dial: "+93" },
  { name: "Albania", code: "AL", dial: "+355" },
  { name: "Algeria", code: "DZ", dial: "+213" },
  { name: "Argentina", code: "AR", dial: "+54" },
  { name: "Australia", code: "AU", dial: "+61" },
  { name: "Austria", code: "AT", dial: "+43" },
  { name: "Azerbaijan", code: "AZ", dial: "+994" },
  { name: "Bahrain", code: "BH", dial: "+973" },
  { name: "Bangladesh", code: "BD", dial: "+880" },
  { name: "Belarus", code: "BY", dial: "+375" },
  { name: "Belgium", code: "BE", dial: "+32" },
  { name: "Bolivia", code: "BO", dial: "+591" },
  { name: "Bosnia & Herzegovina", code: "BA", dial: "+387" },
  { name: "Brazil", code: "BR", dial: "+55" },
  { name: "Brunei", code: "BN", dial: "+673" },
  { name: "Bulgaria", code: "BG", dial: "+359" },
  { name: "Cambodia", code: "KH", dial: "+855" },
  { name: "Canada", code: "CA", dial: "+1" },
  { name: "Chile", code: "CL", dial: "+56" },
  { name: "China", code: "CN", dial: "+86" },
  { name: "Colombia", code: "CO", dial: "+57" },
  { name: "Croatia", code: "HR", dial: "+385" },
  { name: "Cuba", code: "CU", dial: "+53" },
  { name: "Cyprus", code: "CY", dial: "+357" },
  { name: "Czech Republic", code: "CZ", dial: "+420" },
  { name: "Denmark", code: "DK", dial: "+45" },
  { name: "Ecuador", code: "EC", dial: "+593" },
  { name: "Egypt", code: "EG", dial: "+20" },
  { name: "Estonia", code: "EE", dial: "+372" },
  { name: "Ethiopia", code: "ET", dial: "+251" },
  { name: "Finland", code: "FI", dial: "+358" },
  { name: "France", code: "FR", dial: "+33" },
  { name: "Georgia", code: "GE", dial: "+995" },
  { name: "Germany", code: "DE", dial: "+49" },
  { name: "Ghana", code: "GH", dial: "+233" },
  { name: "Greece", code: "GR", dial: "+30" },
  { name: "Guatemala", code: "GT", dial: "+502" },
  { name: "Hungary", code: "HU", dial: "+36" },
  { name: "Iceland", code: "IS", dial: "+354" },
  { name: "India", code: "IN", dial: "+91" },
  { name: "Indonesia", code: "ID", dial: "+62" },
  { name: "Iran", code: "IR", dial: "+98" },
  { name: "Iraq", code: "IQ", dial: "+964" },
  { name: "Ireland", code: "IE", dial: "+353" },
  { name: "Israel", code: "IL", dial: "+972" },
  { name: "Italy", code: "IT", dial: "+39" },
  { name: "Japan", code: "JP", dial: "+81" },
  { name: "Jordan", code: "JO", dial: "+962" },
  { name: "Kazakhstan", code: "KZ", dial: "+7" },
  { name: "Kenya", code: "KE", dial: "+254" },
  { name: "Kuwait", code: "KW", dial: "+965" },
  { name: "Latvia", code: "LV", dial: "+371" },
  { name: "Lebanon", code: "LB", dial: "+961" },
  { name: "Libya", code: "LY", dial: "+218" },
  { name: "Lithuania", code: "LT", dial: "+370" },
  { name: "Luxembourg", code: "LU", dial: "+352" },
  { name: "Malaysia", code: "MY", dial: "+60" },
  { name: "Maldives", code: "MV", dial: "+960" },
  { name: "Mexico", code: "MX", dial: "+52" },
  { name: "Moldova", code: "MD", dial: "+373" },
  { name: "Morocco", code: "MA", dial: "+212" },
  { name: "Myanmar", code: "MM", dial: "+95" },
  { name: "Nepal", code: "NP", dial: "+977" },
  { name: "Netherlands", code: "NL", dial: "+31" },
  { name: "New Zealand", code: "NZ", dial: "+64" },
  { name: "Nigeria", code: "NG", dial: "+234" },
  { name: "Norway", code: "NO", dial: "+47" },
  { name: "Oman", code: "OM", dial: "+968" },
  { name: "Pakistan", code: "PK", dial: "+92" },
  { name: "Palestine", code: "PS", dial: "+970" },
  { name: "Panama", code: "PA", dial: "+507" },
  { name: "Peru", code: "PE", dial: "+51" },
  { name: "Philippines", code: "PH", dial: "+63" },
  { name: "Poland", code: "PL", dial: "+48" },
  { name: "Portugal", code: "PT", dial: "+351" },
  { name: "Qatar", code: "QA", dial: "+974" },
  { name: "Romania", code: "RO", dial: "+40" },
  { name: "Russia", code: "RU", dial: "+7" },
  { name: "Saudi Arabia", code: "SA", dial: "+966" },
  { name: "Serbia", code: "RS", dial: "+381" },
  { name: "Singapore", code: "SG", dial: "+65" },
  { name: "Slovakia", code: "SK", dial: "+421" },
  { name: "Slovenia", code: "SI", dial: "+386" },
  { name: "Somalia", code: "SO", dial: "+252" },
  { name: "South Africa", code: "ZA", dial: "+27" },
  { name: "South Korea", code: "KR", dial: "+82" },
  { name: "Spain", code: "ES", dial: "+34" },
  { name: "Sri Lanka", code: "LK", dial: "+94" },
  { name: "Sudan", code: "SD", dial: "+249" },
  { name: "Sweden", code: "SE", dial: "+46" },
  { name: "Switzerland", code: "CH", dial: "+41" },
  { name: "Syria", code: "SY", dial: "+963" },
  { name: "Taiwan", code: "TW", dial: "+886" },
  { name: "Tanzania", code: "TZ", dial: "+255" },
  { name: "Thailand", code: "TH", dial: "+66" },
  { name: "Tunisia", code: "TN", dial: "+216" },
  { name: "Turkey", code: "TR", dial: "+90" },
  { name: "Uganda", code: "UG", dial: "+256" },
  { name: "Ukraine", code: "UA", dial: "+380" },
  { name: "United Arab Emirates", code: "AE", dial: "+971" },
  { name: "United Kingdom", code: "GB", dial: "+44" },
  { name: "United States", code: "US", dial: "+1" },
  { name: "Uruguay", code: "UY", dial: "+598" },
  { name: "Uzbekistan", code: "UZ", dial: "+998" },
  { name: "Venezuela", code: "VE", dial: "+58" },
  { name: "Vietnam", code: "VN", dial: "+84" },
  { name: "Yemen", code: "YE", dial: "+967" },
  { name: "Zimbabwe", code: "ZW", dial: "+263" },
];

interface PhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  error?: string;
  id?: string;
}

export default function PhoneInput({ value, onChange, error, id = "phone" }: PhoneInputProps) {
  const defaultCountry = COUNTRIES.find((c) => c.code === "BD") ?? COUNTRIES[0];

  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry);
  const [localNumber, setLocalNumber] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) setLocalNumber("");
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (dropdownOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [dropdownOpen]);

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search)
  );

  function handleCountrySelect(country: Country) {
    setSelectedCountry(country);
    setDropdownOpen(false);
    setSearch("");
    onChange(country.dial + " " + localNumber);
  }

  function handleLocalNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d\s\-().]/g, "");
    setLocalNumber(raw);
    onChange(selectedCountry.dial + " " + raw);
  }

  const borderClass = error
    ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500"
    : "border-neutral-300 focus-within:border-primary focus-within:ring-primary";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input row */}
      <div
        className={`flex items-center w-full h-12 bg-white border rounded-lg overflow-hidden transition-colors focus-within:ring-1 ${borderClass}`}
      >
        {/* Country selector trigger */}
        <button
          type="button"
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 px-3 h-full border-r border-neutral-200 bg-neutral-50 hover:bg-neutral-100 transition-colors shrink-0 focus:outline-none"
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
        >
          <FlagImg code={selectedCountry.code} size={20} />
          <span className="text-xs font-semibold text-neutral-800 tabular-nums">
            {selectedCountry.dial}
          </span>
          <svg
            className={`w-3 h-3 text-neutral-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Phone number */}
        <input
          id={id}
          type="tel"
          value={localNumber}
          onChange={handleLocalNumberChange}
          maxLength={15}
          placeholder="1700-000000"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="flex-1 h-full px-3 text-sm text-neutral-900 placeholder:text-neutral-400 bg-transparent focus:outline-none"
        />
      </div>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-72 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-neutral-100">
            <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 rounded-lg">
              <svg
                className="w-3.5 h-3.5 text-neutral-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or code..."
                className="flex-1 text-xs bg-transparent text-neutral-700 placeholder:text-neutral-400 focus:outline-none"
              />
            </div>
          </div>

          {/* List */}
          <ul role="listbox" className="max-h-52 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <li className="py-6 text-center text-xs text-neutral-400">No results</li>
            ) : (
              filteredCountries.map((country) => (
                <li
                  key={country.code}
                  role="option"
                  aria-selected={selectedCountry.code === country.code}
                  onClick={() => handleCountrySelect(country)}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-neutral-50 ${
                    selectedCountry.code === country.code
                      ? "bg-primary/5"
                      : ""
                  }`}
                >
                  <FlagImg code={country.code} size={20} />
                  {/* Dial code — fixed width so names align */}
                  <span
                    className={`text-xs font-semibold tabular-nums w-10 shrink-0 ${
                      selectedCountry.code === country.code
                        ? "text-primary"
                        : "text-neutral-500"
                    }`}
                  >
                    {country.dial}
                  </span>
                  <span
                    className={`flex-1 truncate text-xs ${
                      selectedCountry.code === country.code
                        ? "text-primary font-medium"
                        : "text-neutral-800"
                    }`}
                  >
                    {country.name}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

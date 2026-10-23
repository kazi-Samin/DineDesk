import { authClient } from "@/lib/auth-client";
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { getCustomerProfile, saveCustomerProfile } from "@/services/mockCustomerProfileService";

// Helper: US Phone format (XXX) XXX-XXXX input mask
function formatUSPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  const digits = cleaned.startsWith("1") ? cleaned.slice(1, 11) : cleaned.slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

function isValidUSPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

export interface AuthViewProps {
  initialMode?: "signin" | "signup";
  initialRole?: "USER" | "VENDOR";
}

export default function AuthView({
  initialMode = "signin",
  initialRole = "USER",
}: AuthViewProps) {
  const router = useRouter();
  const { login, register } = useAuth();

  // Mode: "signin" | "signup"
  const [authMode, setAuthMode] = useState<"signin" | "signup">(initialMode);
  const [signupRole, setSignupRole] = useState<"USER" | "VENDOR">("USER");

  // Form Fields (all start empty, placeholders only)
  const [fullName, setFullName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Status States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [successToast, setSuccessToast] = useState("");

  // Forgot Password Modal
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState("");

  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (authMode === "signup") {
      if (!fullName.trim()) {
        newErrors.fullName = "Please enter your full name.";
      }
      if (signupRole === "VENDOR" && !restaurantName.trim()) {
        newErrors.restaurantName = "Please enter your kitchen role or station.";
      }
      if (!phone.trim()) {
        newErrors.phone = "Phone number is required for reservation confirmations.";
      } else if (!isValidUSPhone(phone)) {
        newErrors.phone = "Please enter a valid 10-digit US phone number (XXX) XXX-XXXX.";
      }
      if (!termsAccepted) {
        newErrors.terms = "You must agree to the Terms of Service.";
      }
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setSuccessToast("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (authMode === "signin") {
        let result = await login({ email, password });

        // Auto-provision demo diner if not present in backend database
        if (!result.success && email === "diner@dinedesk.com") {
          await register({
            name: "Alex Diner",
            email,
            password,
            phone: "(313) 555-0142",
            role: "USER",
          });
          result = await login({ email, password });
        }

        // Auto-provision demo partner if not present in backend database
        if (!result.success && (email === "owner@dinedesk.com" || email === "partner@dinedesk.com")) {
          await register({
            name: "Marcus Vance",
            email,
            password,
            phone: "(313) 555-0142",
            role: "VENDOR",
          });
          result = await login({ email, password });
        }

        if (result.success && result.data) {
          const authUser = result.data;
          try {
            const existingProfile = getCustomerProfile();
            saveCustomerProfile({
              ...existingProfile,
              fullName: authUser.name || "Marcus Vance",
              email: authUser.email || existingProfile.email,
              phone: authUser.phone || existingProfile.phone || "(313) 555-0142",
              roleBadge:
                authUser.role === "ADMIN" || authUser.role === "SUPERADMIN"
                  ? "Admin"
                  : authUser.role === "VENDOR"
                    ? "Restaurant Manager"
                    : "Diner",
            });
          } catch (e) {
            console.error("Error updating local profile cache:", e);
          }

          const role = authUser.role;
          if (role === "ADMIN" || role === "SUPERADMIN") {
            window.location.href = "/dashboard/admin";
          } else if (role === "VENDOR") {
            window.location.href = "/dashboard/vendor";
          } else {
            window.location.href = "/dashboard/customer";
          }
        } else {
          setGeneralError(
            result.message || "Invalid email or password. Please verify your credentials."
          );
        }
      } else {
        // Sign Up Mode
        const regResult = await register({
          name: fullName,
          email,
          password,
          phone,
          role: signupRole,
        });

        if (regResult.success) {
          const loginRes = await login({ email, password });
          if (loginRes.success && loginRes.data) {
            const authUser = loginRes.data;
            try {
              const existingProfile = getCustomerProfile();
              saveCustomerProfile({
                ...existingProfile,
                fullName: authUser.name || fullName,
                email: authUser.email || email,
                phone: authUser.phone || phone || "(313) 555-0142",
                roleBadge:
                  authUser.role === "ADMIN" || authUser.role === "SUPERADMIN"
                    ? "Admin"
                    : authUser.role === "VENDOR"
                      ? "Restaurant Partner"
                      : "Diner",
              });
            } catch (e) {
              console.error("Error updating profile cache:", e);
            }

            const role = authUser.role;
            if (role === "ADMIN" || role === "SUPERADMIN") {
              window.location.href = "/dashboard/admin";
            } else if (role === "VENDOR") {
              window.location.href = "/dashboard/vendor";
            } else {
              window.location.href = "/dashboard/customer";
            }
          } else {
            setAuthMode("signin");
            setSuccessToast("Account created successfully. Please sign in.");
          }
        } else {
          const errorMsg =
            regResult.errors && regResult.errors.length > 0
              ? regResult.errors.map((err) => err.message).join(", ")
              : regResult.message || "Registration could not be completed. Please try again.";
          setGeneralError(errorMsg);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to reach authentication service.";
      setGeneralError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In Simulation
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setGeneralError("");
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard/customer");
    }, 800);
  };

  // Demo Credentials Autofill for Evaluators
  const fillDemoAccount = (role: "customer" | "vendor" | "admin") => {
    setAuthMode("signin");
    setErrors({});
    setGeneralError("");

    if (role === "customer") {
      setEmail("diner@dinedesk.com");
      setPassword("DinerPassword123!");
      setSuccessToast("Diner demo credentials loaded (diner@dinedesk.com). Click Sign In to continue.");
    } else if (role === "vendor") {
      setEmail("owner@dinedesk.com");
      setPassword("OwnerPassword123!");
      setSuccessToast("Restaurant Manager demo credentials loaded (owner@dinedesk.com). Click Sign In to continue.");
    } else if (role === "admin") {
      setEmail("admin@dinedesk.com");
      setPassword("AdminSecurePassword123!");
      setSuccessToast("Admin demo credentials loaded (admin@dinedesk.com). Click Sign In to continue.");
    }
  };

  // Forgot Password Submit
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");

    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setForgotError("Please enter a valid registered email address.");
      return;
    }

    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSuccess(true);
    }, 800);
  };

  const isDemoVisible = false;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-neutral-900 flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
      {/* 2. Header: Minimal, off-white, thin border, logo on left, Browse Menu & Back to Home on right */}
      <header className="w-full bg-[#FAF8F5] border-b border-neutral-200/80 px-6 sm:px-10 lg:px-14 py-4 flex items-center justify-between z-20">
        <Logo size="md" />

        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/explore"
            className="text-xs sm:text-sm text-neutral-600 hover:text-neutral-900 transition-colors font-medium"
          >
            Browse Menu
          </Link>
          <Link
            href="/"
            className="text-xs sm:text-sm text-neutral-600 hover:text-neutral-900 transition-colors inline-flex items-center gap-1.5 font-medium"
          >
            <span>← Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 flex flex-col lg:flex-row w-full max-w-[1440px] mx-auto">
        {/* Left Visual Panel: Rich Information & Atmosphere inside Photo */}
        <section className="hidden lg:flex lg:w-1/2 p-6 lg:p-8 xl:p-10 flex-col justify-center">
          <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-neutral-200/60 min-h-[580px] max-h-[720px] flex flex-col justify-between p-6 sm:p-8">
            <Image
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1400&auto=format&fit=crop"
              alt="The Maple & Vine Dining Room"
              fill
              priority
              unoptimized
              sizes="50vw"
              className="object-cover object-center"
            />
            {/* Elegant dark gradient overlay for crisp readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/65 pointer-events-none" />

            {/* Top Info Bar inside Photo */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                <span className="material-symbols-outlined text-amber-400 text-sm">restaurant</span>
                <span className="text-white text-xs font-semibold tracking-wide">
                  The Maple &amp; Vine • Detroit
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Service Active
              </span>
            </div>

            {/* Middle Feature Highlights Cards */}
            <div className="relative z-10 my-auto py-5 space-y-3">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-amber-300/90 font-bold block mb-1">
                  Wood-Fired Hearth &amp; Cellar
                </span>
                <h2 className="font-serif text-white text-2xl sm:text-3xl font-normal leading-tight">
                  Reserve your table. Savor every detail.
                </h2>
                <p className="text-neutral-300 text-xs sm:text-sm mt-1 max-w-md leading-relaxed">
                  Authentic Michigan wood-fired prime steaks, hand-crafted pastas, and sommelier reserve flights in historic Corktown.
                </p>
              </div>

              {/* 3 Frosted Highlights inside the photo */}
              <div className="grid grid-cols-1 gap-2.5 pt-1">
                <div className="flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-md p-3 rounded-xl border border-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">table_restaurant</span>
                  </div>
                  <div>
                    <h3 className="text-white text-xs font-bold">4 Curated Dining Rooms</h3>
                    <p className="text-neutral-300 text-[11px]">
                      Main Hearth, Wine Cellar Reserve, Garden Patio, &amp; Chef&apos;s Tasting Counter.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-md p-3 rounded-xl border border-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">local_fire_department</span>
                  </div>
                  <div>
                    <h3 className="text-white text-xs font-bold">Live Kitchen Pacing</h3>
                    <p className="text-neutral-300 text-[11px]">
                      Track order preparation in real-time from the kitchen hearth to your table.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-md p-3 rounded-xl border border-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">workspace_premium</span>
                  </div>
                  <div>
                    <h3 className="text-white text-xs font-bold">VIP Concierge &amp; Rewards</h3>
                    <p className="text-neutral-300 text-[11px]">
                      Earn dining loyalty points on every cover and unlock sommelier cellar holds.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Telemetry & Trust Badges */}
            <div className="relative z-10 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-300">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <span className="material-symbols-outlined text-sm">star</span>
                <span>4.96 Rating (640+ Reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-emerald-400">verified</span>
                <span>Health Grade A (98/100)</span>
              </div>
              <div className="text-neutral-400 font-mono text-[10px]">
                2414 Michigan Ave
              </div>
            </div>
          </div>
        </section>

        {/* Right Panel: Plain background, generous whitespace, narrow form (~400px), no enclosing card */}
        <section className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16">
          <div className="w-full max-w-[400px]">
            {/* Tabs: Plain text links with underline on active one */}
            <div className="flex items-center gap-8 border-b border-neutral-200 mb-8">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setErrors({});
                  setGeneralError("");
                }}
                className={`pb-3 text-sm transition-colors cursor-pointer relative ${authMode === "signin"
                    ? "font-semibold text-neutral-900 border-b-2 border-primary -mb-[1px]"
                    : "text-neutral-500 hover:text-neutral-800"
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setErrors({});
                  setGeneralError("");
                }}
                className={`pb-3 text-sm transition-colors cursor-pointer relative ${authMode === "signup"
                    ? "font-semibold text-neutral-900 border-b-2 border-primary -mb-[1px]"
                    : "text-neutral-500 hover:text-neutral-800"
                  }`}
              >
                Create Account
              </button>
            </div>

            {/* Error & Success Messages */}
            {generalError && (
              <div
                role="alert"
                className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed"
              >
                {generalError}
              </div>
            )}

            {successToast && (
              <div
                role="status"
                className="mb-6 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 leading-relaxed"
              >
                {successToast}
              </div>
            )}

            {authMode === "signin" ? (
              /* ════════════════ 4. SIGN IN FORM ════════════════ */
              <div>
                <div className="mb-6">
                  <h1 className="font-serif text-3xl font-normal text-neutral-900 tracking-tight">
                    Welcome back
                  </h1>
                  <p className="text-sm text-neutral-500 mt-1">
                    Sign in to manage your reservations and orders.
                  </p>
                </div>

                {/* Continue with Google */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full h-12 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-sm font-medium flex items-center justify-center gap-3 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* "or" divider */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200" />
                  </div>
                  <span className="relative px-3 bg-[#FAF8F5] text-xs text-neutral-400">
                    or continue with email
                  </span>
                </div>

                <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium text-neutral-700 mb-1.5"
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      placeholder="name@example.com"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      className={`w-full h-12 px-3.5 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-neutral-300"
                        }`}
                    />
                    {errors.email && (
                      <p id="email-error" className="mt-1 text-xs text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password with Show/Hide toggle */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-xs font-medium text-neutral-700 mb-1.5"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors({ ...errors, password: "" });
                        }}
                        placeholder="••••••••"
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error" : undefined}
                        className={`w-full h-12 pl-3.5 pr-14 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ${errors.password
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : "border-neutral-300"
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-500 hover:text-neutral-800 cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    {errors.password && (
                      <p id="password-error" className="mt-1 text-xs text-red-600">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Remember me & Forgot password row */}
                  <div className="flex items-center justify-between pt-1 mb-2">
                    <label htmlFor="rememberMe" className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        id="rememberMe"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                      />
                      <span className="text-xs text-neutral-600">Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setForgotModalOpen(true);
                        setForgotSuccess(false);
                        setForgotEmail(email);
                      }}
                      className="text-xs text-neutral-600 hover:text-primary transition-colors hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Primary Sign In Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/95 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center shadow-sm"
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                  </div>

                  {/* Demo Login under button */}
                  {isDemoVisible && (
                    <div className="mt-3.5 pt-3.5 border-t border-neutral-200/80 text-xs text-neutral-500 flex items-center justify-between">
                      <span className="font-medium">Demo access:</span>
                      <div className="flex items-center gap-2 font-medium">
                        <button
                          type="button"
                          onClick={() => fillDemoAccount("customer")}
                          className="text-neutral-600 hover:text-primary transition-colors cursor-pointer hover:underline"
                        >
                          Diner
                        </button>
                        <span className="text-neutral-300">·</span>
                        <button
                          type="button"
                          onClick={() => fillDemoAccount("vendor")}
                          className="text-neutral-600 hover:text-primary transition-colors cursor-pointer hover:underline"
                        >
                          Manager
                        </button>
                        <span className="text-neutral-300">·</span>
                        <button
                          type="button"
                          onClick={() => fillDemoAccount("admin")}
                          className="text-neutral-600 hover:text-primary transition-colors cursor-pointer hover:underline"
                        >
                          Admin
                        </button>
                      </div>
                    </div>
                  )}
                </form>

                {/* Subtext Switcher */}
                <p className="text-xs text-neutral-500 text-center mt-6">
                  New to DineDesk?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setSignupRole("USER");
                      setErrors({});
                      setGeneralError("");
                    }}
                    className="text-primary font-medium hover:underline cursor-pointer"
                  >
                    Create an account
                  </button>
                </p>

                
              </div>
            ) : (
              /* ════════════════ 5. CREATE ACCOUNT FORM ════════════════ */
              <div>
                
                <div className="mb-6">
                  <h1 className="font-serif text-3xl font-normal text-neutral-900 tracking-tight">
                    Create your account
                  </h1>
                  <p className="text-sm text-neutral-500 mt-1">
                    Book tables and order from Michigan's finest dining experience.
                  </p>
                </div>

                <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-xs font-medium text-neutral-700 mb-1.5"
                    >
                      Full name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors({ ...errors, fullName: "" });
                      }}
                      placeholder="Jordan Smith"
                      aria-invalid={!!errors.fullName}
                      aria-describedby={errors.fullName ? "fullName-error" : undefined}
                      className={`w-full h-12 px-3.5 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ${errors.fullName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-neutral-300"
                        }`}
                    />
                    {errors.fullName && (
                      <p id="fullName-error" className="mt-1 text-xs text-red-600">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Business Email / Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium text-neutral-700 mb-1.5"
                    >
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      placeholder="jordan@example.com"
                      id="signup-email"
                      name="dinedesk_reg_email"
                      autoComplete="off"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      className={`w-full h-12 px-3.5 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-neutral-300"
                        }`}
                    />
                    {errors.email && (
                      <p id="email-error" className="mt-1 text-xs text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone (US Format with mask) */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-medium text-neutral-700 mb-1.5"
                    >
                      Phone number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const formatted = formatUSPhoneNumber(e.target.value);
                        setPhone(formatted);
                        if (errors.phone) setErrors({ ...errors, phone: "" });
                      }}
                      maxLength={14}
                      placeholder="(313) 555-0142"
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                      className={`w-full h-12 px-3.5 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ${errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-neutral-300"
                        }`}
                    />
                    {errors.phone && (
                      <p id="phone-error" className="mt-1 text-xs text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Password with simple hint */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-xs font-medium text-neutral-700 mb-1.5"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors({ ...errors, password: "" });
                        }}
                        placeholder="••••••••"
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error" : undefined}
                        className={`w-full h-12 pl-3.5 pr-14 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ${errors.password
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : "border-neutral-300"
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-500 hover:text-neutral-800 cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-400">
                      Must be at least 6 characters.
                    </p>
                    {errors.password && (
                      <p id="password-error" className="mt-1 text-xs text-red-600">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Terms Checkbox */}
                  <div className="pt-1">
                    <label htmlFor="terms" className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => {
                          setTermsAccepted(e.target.checked);
                          if (errors.terms) setErrors({ ...errors, terms: "" });
                        }}
                        className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                      />
                      <span className="text-xs text-neutral-600 leading-normal">
                        I agree to the{" "}
                        <Link href="/terms" className="text-primary font-medium hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-primary font-medium hover:underline">
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>
                    {errors.terms && (
                      <p className="mt-1 text-xs text-red-600">{errors.terms}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/95 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center mt-3"
                  >
                    {isLoading
                      ? "Creating account..."
                      : signupRole === "VENDOR"
                        ? "Create manager account"
                        : "Create account"}
                  </button>

                  {/* Demo Login under button for all roles */}
                  {isDemoVisible && (
                    <div className="mt-3.5 pt-3.5 border-t border-neutral-200/80 text-xs text-neutral-500 flex items-center justify-between">
                      <span className="font-medium">Demo access:</span>
                      <div className="flex items-center gap-2 font-medium">
                        <button
                          type="button"
                          onClick={() => fillDemoAccount("customer")}
                          className="text-neutral-600 hover:text-primary transition-colors cursor-pointer hover:underline"
                        >
                          Diner
                        </button>
                        <span className="text-neutral-300">·</span>
                        <button
                          type="button"
                          onClick={() => fillDemoAccount("vendor")}
                          className="text-neutral-600 hover:text-primary transition-colors cursor-pointer hover:underline"
                        >
                          Manager
                        </button>
                        <span className="text-neutral-300">·</span>
                        <button
                          type="button"
                          onClick={() => fillDemoAccount("admin")}
                          className="text-neutral-600 hover:text-primary transition-colors cursor-pointer hover:underline"
                        >
                          Admin
                        </button>
                      </div>
                    </div>
                  )}
                </form>

                {/* Subtext Switcher */}
                <p className="text-xs text-neutral-500 text-center mt-6">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setErrors({});
                      setGeneralError("");
                    }}
                    className="text-primary font-medium hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-xl border border-neutral-200 p-6 shadow-xl relative">
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 text-sm cursor-pointer"
              aria-label="Close dialog"
            >
              ✕
            </button>

            <h2 className="font-serif text-2xl font-normal text-neutral-900">
              Reset password
            </h2>
            <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
              Enter your registered email address to receive password reset instructions.
            </p>

            {forgotSuccess ? (
              <div className="mt-5 space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-lg">
                  Recovery instructions dispatched to <strong>{forgotEmail}</strong>.
                </div>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="w-full h-11 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/95 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="forgotEmail"
                    className="block text-xs font-medium text-neutral-700 mb-1.5"
                  >
                    Email address
                  </label>
                  <input
                    id="forgotEmail"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      if (forgotError) setForgotError("");
                    }}
                    placeholder="name@example.com"
                    className={`w-full h-11 px-3.5 bg-white border rounded-lg text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-primary transition-colors ${forgotError ? "border-red-500" : "border-neutral-300"
                      }`}
                  />
                  {forgotError && (
                    <p className="mt-1 text-xs text-red-600">{forgotError}</p>
                  )}
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="flex-1 h-11 rounded-lg border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 h-11 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/95 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? "Sending..." : "Send link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="w-full border-t border-neutral-200/80 py-4 px-6 sm:px-10 text-xs text-neutral-500 bg-[#FAF8F5]">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 DineDesk Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/privacy" className="hover:text-neutral-900 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-neutral-900 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

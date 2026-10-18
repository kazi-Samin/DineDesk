"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function SignInPage() {
  const router = useRouter();
  const { login, register } = useAuth();

  // Mode: "signin" | "signup"
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [signupRole, setSignupRole] = useState<"USER" | "VENDOR">("USER");

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Validation & Submission States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [successToast, setSuccessToast] = useState("");

  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState("");

  // Validation Logic
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (authMode === "signup" && !fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
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

    if (authMode === "signup" && !phone.trim()) {
      newErrors.phone = "Phone number is required for table confirmations.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setSuccessToast("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (authMode === "signin") {
        const result = await login({ email, password });
        if (result.success && result.data) {
          const role = result.data.role;
          if (role === "ADMIN") {
            router.push("/dashboard/admin");
          } else if (role === "VENDOR") {
            router.push("/dashboard/vendor");
          } else {
            router.push("/dashboard/customer");
          }
        } else {
          setGeneralError(
            result.message || "Invalid email or password. Please verify your credentials or create an account."
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
          // Auto login upon successful registration
          const loginRes = await login({ email, password });
          if (loginRes.success && loginRes.data) {
            const role = loginRes.data.role;
            if (role === "ADMIN") {
              router.push("/dashboard/admin");
            } else if (role === "VENDOR") {
              router.push("/dashboard/vendor");
            } else {
              router.push("/dashboard/customer");
            }
          } else {
            setAuthMode("signin");
            setSuccessToast("Registration successful! Please sign in with your credentials.");
          }
        } else {
          const errorMsg =
            regResult.errors && regResult.errors.length > 0
              ? regResult.errors.map((err) => err.message).join(", ")
              : regResult.message || "Registration failed. Please try again.";
          setGeneralError(errorMsg);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to reach the authentication server.";
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

  // Demo Credentials Helper
  const fillDemoAccount = (role: "customer" | "vendor" | "admin") => {
    setAuthMode("signin");
    setErrors({});
    setGeneralError("");

    if (role === "customer") {
      setEmail("samin_test_1792345880620@dinedesk.com");
      setPassword("Password123!");
    } else if (role === "vendor") {
      setEmail("vendor@sultansheritage.com");
      setPassword("HeritageVendor2025!");
    } else if (role === "admin") {
      setEmail("admin@dinedesk.com");
      setPassword("SuperAdminSecure2025!");
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

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between font-body-md text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Top Banner Navigation */}
      <header className="w-full bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant px-6 sm:px-12 py-3.5 flex items-center justify-between z-30 sticky top-0">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center font-display font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
            D
          </div>
          <div className="flex flex-col">
            <span className="font-display font-medium text-lg text-primary tracking-tight leading-tight">
              DineDesk
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">
              Fine Dining Directory
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <span className="hidden md:inline text-xs text-on-surface-variant">
            Looking for Dhaka&apos;s best tables?
          </span>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface hover:text-primary hover:border-primary transition-all bg-surface hover:bg-surface-container"
          >
            <span>Explore Restaurants</span>
            <span className="material-symbols-outlined text-sm">arrow_outward</span>
          </Link>
        </div>
      </header>

      {/* Main Split Content */}
      <main className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10 gap-8 items-center justify-center">
        {/* Left Visual Panel — Fine Dining Atmosphere (Desktop) */}
        <section className="hidden lg:flex flex-col justify-between relative w-full lg:w-1/2 h-[760px] rounded-3xl overflow-hidden shadow-xl border border-outline-variant/60 group">
          {/* Background Image */}
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkzt8YSL3wvfAeB2Tbck_QrHDBQI3WVDtsVBPdxz5Bq3U_4dKOv1B8GIYpLrchaLxJanNgAtcDJyBcNmac1GIWXdyaryXorRTZfLBCWwZjvY_z8TzXhk5yvn6iLZpxb41pLVMZ5mEc4EM8O73Zoq6r22ia0KHq4MMxrjMifonMbOcLlsfLyKIJUQKl9dFlSJSslcw4Zzv37jybRqGIgCkm_1j79a71Hx63j3UnwJpSnNqRmW_paRWAdA"
            alt="Atmospheric Dining at Sultan's Heritage Kitchen Banani"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
          />

          {/* Luxury Ambient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25 pointer-events-none" />

          {/* Top Panel Badge */}
          <div className="relative z-10 p-8 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/90 text-xs font-medium tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Dhaka&apos;s Premier Culinary Network
            </span>
            <div className="flex items-center gap-1.5 text-amber-300 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs">
              <span className="material-symbols-outlined text-sm">stars</span>
              <span className="font-semibold text-white">4.9</span>
              <span className="text-white/60">(12k+ Diners)</span>
            </div>
          </div>

          {/* Floating Live Reservation Preview Card */}
          <div className="relative z-10 px-8 py-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 text-white max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-lg">
                    verified
                  </span>
                  <span className="text-xs font-bold tracking-wider uppercase text-emerald-300">
                    Confirmed Reservation
                  </span>
                </div>
                <span className="text-[11px] text-white/70 font-mono">Tonight • 8:30 PM</span>
              </div>

              <div className="pt-3">
                <h2 className="font-display font-medium text-lg leading-snug">
                  Sultan&apos;s Heritage Kitchen • Banani
                </h2>
                <p className="text-xs text-white/80 mt-1 flex items-center gap-2">
                  <span>2 Guests</span>
                  <span>•</span>
                  <span>Chef&apos;s Courtyard Table</span>
                  <span>•</span>
                  <span className="text-amber-300 font-medium">Fine Dining</span>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/75">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-emerald-400">
                    check_circle
                  </span>
                  Direct Synchronized Table
                </span>
                <span className="font-serif italic text-white/90">DineDesk Concierge</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Editorial Quote & Network Statistics */}
          <div className="relative z-10 p-8 space-y-4">
            <blockquote className="font-display italic text-xl text-white/95 leading-relaxed max-w-lg">
              &ldquo;Where Dhaka&apos;s most discerning palates discover and reserve handcrafted
              culinary experiences.&rdquo;
            </blockquote>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20 text-white">
              <div>
                <p className="text-2xl font-serif font-bold text-white">120+</p>
                <p className="text-[11px] text-white/75 uppercase tracking-wider">
                  Curated Tables
                </p>
              </div>
              <div>
                <p className="text-2xl font-serif font-bold text-white">99.8%</p>
                <p className="text-[11px] text-white/75 uppercase tracking-wider">
                  Confirmation Rate
                </p>
              </div>
              <div>
                <p className="text-2xl font-serif font-bold text-white">Instant</p>
                <p className="text-[11px] text-white/75 uppercase tracking-wider">
                  SMS &amp; Email Pass
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Authentication Panel */}
        <section className="w-full lg:w-1/2 max-w-lg flex flex-col justify-center">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 sm:p-10 shadow-lg">
            {/* Mode Switcher Tabs */}
            <div className="flex bg-surface-container rounded-2xl p-1 mb-8 border border-outline-variant/60">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setErrors({});
                  setGeneralError("");
                }}
                className={`flex-1 py-2.5 rounded-xl font-label-lg text-xs font-semibold transition-all cursor-pointer ${
                  authMode === "signin"
                    ? "bg-surface-container-lowest text-primary shadow-sm font-bold"
                    : "text-on-surface-variant hover:text-on-surface"
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
                className={`flex-1 py-2.5 rounded-xl font-label-lg text-xs font-semibold transition-all cursor-pointer ${
                  authMode === "signup"
                    ? "bg-surface-container-lowest text-primary shadow-sm font-bold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Header Titles */}
            <div className="space-y-2 mb-6">
              <h1 className="font-display font-medium text-2xl sm:text-3xl text-on-surface tracking-tight">
                {authMode === "signin" ? "Welcome back" : "Create your dining pass"}
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                {authMode === "signin"
                  ? "Sign in to manage your reservations, curated dining favorites, and concierge benefits."
                  : "Join Dhaka's premier dining platform for instant table reservations and personalized culinary recommendations."}
              </p>
            </div>

            {/* Error Notification Banner */}
            {generalError && (
              <div className="mb-6 p-3.5 rounded-2xl bg-error-container/40 border border-error/30 text-error text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-base shrink-0">error</span>
                <span>{generalError}</span>
              </div>
            )}

            {/* Success Notification Banner */}
            {successToast && (
              <div className="mb-6 p-3.5 rounded-2xl bg-primary-fixed border border-primary-fixed-dim text-on-primary-fixed text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
                <span>{successToast}</span>
              </div>
            )}

            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-outline-variant rounded-2xl bg-surface hover:bg-surface-container text-on-surface text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-[0.99] cursor-pointer disabled:opacity-50"
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

            {/* Editorial Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant" />
              </div>
              <span className="relative px-3 bg-surface-container-lowest text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">
                or continue with email
              </span>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Type Selector (Sign Up Only) */}
              {authMode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSignupRole("USER")}
                      className={`py-2.5 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        signupRole === "USER"
                          ? "bg-primary text-on-primary border-primary shadow-sm"
                          : "bg-surface text-on-surface-variant border-outline-variant hover:text-on-surface hover:bg-surface-container"
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">person</span>
                      <span>Diner (Guest)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignupRole("VENDOR")}
                      className={`py-2.5 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        signupRole === "VENDOR"
                          ? "bg-primary text-on-primary border-primary shadow-sm"
                          : "bg-surface text-on-surface-variant border-outline-variant hover:text-on-surface hover:bg-surface-container"
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">storefront</span>
                      <span>Restaurant Partner</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Full Name Field (Sign Up Only) */}
              {authMode === "signup" && (
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-semibold text-on-surface mb-1.5"
                  >
                    Full Name <span className="text-secondary">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                      <span className="material-symbols-outlined text-lg">person</span>
                    </span>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors({ ...errors, fullName: "" });
                      }}
                      placeholder="e.g. Tahmid Rahman"
                      className={`w-full bg-surface border rounded-2xl py-3 pl-10 pr-4 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-all ${
                        errors.fullName ? "border-error" : "border-outline-variant"
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-error flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      {errors.fullName}
                    </p>
                  )}
                </div>
              )}

              {/* Email Address Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-on-surface mb-1.5"
                >
                  Email Address <span className="text-secondary">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                    <span className="material-symbols-outlined text-lg">mail</span>
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    placeholder="e.g. diner@dinedesk.com"
                    className={`w-full bg-surface border rounded-2xl py-3 pl-10 pr-4 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-all ${
                      errors.email ? "border-error" : "border-outline-variant"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-error flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone Field (Sign Up Only) */}
              {authMode === "signup" && (
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-semibold text-on-surface mb-1.5"
                  >
                    Mobile Phone Number <span className="text-secondary">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                      <span className="material-symbols-outlined text-lg">call</span>
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors({ ...errors, phone: "" });
                      }}
                      placeholder="+880 1712-345678"
                      className={`w-full bg-surface border rounded-2xl py-3 pl-10 pr-4 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-all ${
                        errors.phone ? "border-error" : "border-outline-variant"
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-error flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      {errors.phone}
                    </p>
                  )}
                </div>
              )}

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="text-xs font-semibold text-on-surface">
                    Password <span className="text-secondary">*</span>
                  </label>
                  {authMode === "signin" && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotModalOpen(true);
                        setForgotSuccess(false);
                        setForgotEmail(email);
                      }}
                      className="text-xs font-medium text-secondary hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                    <span className="material-symbols-outlined text-lg">lock</span>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                    placeholder="Enter your secret password"
                    className={`w-full bg-surface border rounded-2xl py-3 pl-10 pr-11 text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-all ${
                      errors.password ? "border-error" : "border-outline-variant"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-on-surface cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-error flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Device Checkbox */}
              {authMode === "signin" && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant cursor-pointer accent-primary"
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-xs text-on-surface-variant cursor-pointer select-none"
                  >
                    Remember this device for 30 days
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/95 text-on-primary font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">
                      progress_activity
                    </span>
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>{authMode === "signin" ? "Sign In to DineDesk" : "Complete Registration"}</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access (Subtle and clean, not intrusive test UI) */}
            <div className="mt-8 pt-5 border-t border-outline-variant/60">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-secondary">
                    key
                  </span>
                  Quick Demo Access
                </span>
                <span className="text-[10px] text-on-surface-variant/70">1-click autofill</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount("customer")}
                  className="py-1.5 px-2 rounded-xl bg-surface hover:bg-surface-container border border-outline-variant text-[11px] font-semibold text-on-surface flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs text-primary">person</span>
                  <span>Diner</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount("vendor")}
                  className="py-1.5 px-2 rounded-xl bg-surface hover:bg-surface-container border border-outline-variant text-[11px] font-semibold text-on-surface flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs text-secondary">storefront</span>
                  <span>Partner</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount("admin")}
                  className="py-1.5 px-2 rounded-xl bg-surface hover:bg-surface-container border border-outline-variant text-[11px] font-semibold text-on-surface flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs text-amber-700">shield_person</span>
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {/* Partner Direct Links */}
            <div className="mt-6 pt-4 border-t border-outline-variant/60 text-center space-y-2">
              <p className="text-xs text-on-surface-variant">
                Are you a restaurant partner?{" "}
                <Link
                  href="/dashboard/vendor"
                  className="font-semibold text-secondary hover:underline inline-flex items-center gap-0.5"
                >
                  Merchant Console Sign In &rarr;
                </Link>
              </p>
              <p className="text-[11px] text-on-surface-variant/75 flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-emerald-600">lock</span>
                <span>256-bit SSL encrypted • Instant table synchronization</span>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 sm:p-8 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="absolute top-5 right-5 text-on-surface-variant hover:text-on-surface p-1 rounded-full cursor-pointer"
                aria-label="Close dialog"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              <div className="w-12 h-12 rounded-2xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">lock_reset</span>
              </div>

              <h2 className="font-display font-medium text-xl text-on-surface">
                Reset your password
              </h2>
              <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                Enter your registered DineDesk email address. We&apos;ll send you instructions and a
                secure recovery link to reset your account password.
              </p>

              {forgotSuccess ? (
                <div className="mt-5 p-4 rounded-2xl bg-primary-fixed text-on-primary-fixed border border-primary-fixed-dim space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-xs">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    <span>Recovery link dispatched!</span>
                  </div>
                  <p className="text-xs text-on-primary-fixed-variant leading-relaxed">
                    Check your inbox at <span className="font-bold">{forgotEmail}</span>. Please
                    follow the instructions in the email to set a new password.
                  </p>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold mt-2 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="mt-5 space-y-4">
                  <div>
                    <label
                      htmlFor="forgotEmail"
                      className="block text-xs font-semibold text-on-surface mb-1.5"
                    >
                      Registered Email Address
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
                      className={`w-full bg-surface border rounded-2xl py-3 px-4 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-all ${
                        forgotError ? "border-error" : "border-outline-variant"
                      }`}
                    />
                    {forgotError && (
                      <p className="mt-1 text-xs text-error flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        {forgotError}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(false)}
                      className="flex-1 py-3 px-4 rounded-2xl border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 py-3 px-4 rounded-2xl bg-primary hover:bg-primary/95 text-on-primary text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {forgotLoading ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-sm">
                            progress_activity
                          </span>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>Send Link</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-outline-variant py-4 px-6 text-center text-xs text-on-surface-variant bg-surface-container-lowest/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 DineDesk Technologies Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/concierge" className="hover:text-primary transition-colors">
              Concierge Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

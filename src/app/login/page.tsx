"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { LoginPayload } from "@/types/auth";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { login, isAuthenticated, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  const onSubmit = async (payload: LoginPayload) => {
    setSubmitting(true);
    try {
      await login(payload);
      showToast("Login successful.", "success");
      router.replace("/dashboard");
    } catch {
      showToast("Invalid credentials.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-brand">
        <img src="/alicesoft-logo.png" alt="Alicesoft Logo" className="login-brand-logo" />
        <div>
          <h1 className="login-company">Alicesoft</h1>
          <p className="login-subtitle">Payroll Management Platform</p>
        </div>
      </div>
      <Card className="login-card" title="Sign In">
        <form className="stack-16" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            placeholder="hr.admin@bfiaps.com"
            error={errors.email?.message}
            {...register("email", { required: "Email is required." })}
          />
          <label className="input-group">
            <span className="input-label">Password</span>
            <div className="password-field-wrap">
              <input
                className="input"
                type={showPassword ? "text" : "password"}
                placeholder="Password123"
                {...register("password", { required: "Password is required." })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password?.message ? <span className="input-error">{errors.password.message}</span> : null}
          </label>
          <Button type="submit" isLoading={submitting}>
            Login
          </Button>
        </form>
      </Card>
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = (formData.get("firstName") as string)?.trim() || "";
  const lastName = (formData.get("lastName") as string)?.trim() || "";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        display_name: `${firstName} ${lastName}`.trim(),
      },
    },
  });

  if (error) {
    redirect("/signup?error=" + encodeURIComponent(error.message));
  }

  // Profile row + storage folders are created by the DB trigger (handle_new_user)
  // which fires on auth.users insert. No need to duplicate that work here.

  revalidatePath("/", "layout");
  redirect("/signup?message=Check your email to confirm your account");
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback?next=/reset-password`,
  });

  if (error) {
    redirect("/forgot-password?error=" + encodeURIComponent(error.message));
  }

  redirect("/forgot-password?message=Check your email for a password reset link");
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    redirect("/reset-password?error=Passwords do not match");
  }

  if (password.length < 6) {
    redirect("/reset-password?error=Password must be at least 6 characters");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect("/reset-password?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/", "layout");
  redirect("/login?message=Password updated successfully. Please sign in.");
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const firstName = (formData.get("firstName") as string)?.trim() || "";
  const lastName = (formData.get("lastName") as string)?.trim() || "";
  const dateOfBirth = (formData.get("dateOfBirth") as string) || null;
  const expectedAnnualReturn = parseFloat(formData.get("expectedAnnualReturn") as string) || 7;
  const timeHorizonYears = parseInt(formData.get("timeHorizonYears") as string, 10) || 20;
  const newEmail = formData.get("email") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Update profiles table
  const profileUpdates: Record<string, string | number | null> = {
    first_name: firstName,
    last_name: lastName,
    expected_annual_return: expectedAnnualReturn,
    time_horizon_years: timeHorizonYears,
    updated_at: new Date().toISOString(),
  };
  if (dateOfBirth) {
    profileUpdates.date_of_birth = dateOfBirth;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update(profileUpdates)
    .eq("id", user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  // Update auth user metadata
  const displayName = `${firstName} ${lastName}`.trim();
  const authUpdates: { data?: { display_name: string; first_name: string; last_name: string }; email?: string; password?: string } = {
    data: { display_name: displayName, first_name: firstName, last_name: lastName },
  };

  if (newEmail && newEmail !== user.email) {
    authUpdates.email = newEmail;
  }

  if (newPassword) {
    if (newPassword !== confirmPassword) {
      return { error: "Passwords do not match" };
    }
    if (newPassword.length < 6) {
      return { error: "Password must be at least 6 characters" };
    }
    authUpdates.password = newPassword;
  }

  const { error } = await supabase.auth.updateUser(authUpdates);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    emailChanged: !!(newEmail && newEmail !== user.email),
  };
}

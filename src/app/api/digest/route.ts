import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { DigestEmail } from "@/lib/email-templates/digest";
import { isAuditReady, calculateExpectedReturn } from "@/lib/types";
import React from "react";

// Cron-invokable endpoint for sending email digests
// Secure with CRON_SECRET in production
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY not configured" },
      { status: 500 }
    );
  }

  // Use service-role key to query all users
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Determine frequency based on current day
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const dayOfMonth = now.getDate();
  const frequencies: string[] = [];

  // Weekly on Mondays
  if (dayOfWeek === 1) frequencies.push("weekly");
  // Monthly on the 1st
  if (dayOfMonth === 1) frequencies.push("monthly");

  if (frequencies.length === 0) {
    return NextResponse.json({ message: "No digests scheduled today", sent: 0 });
  }

  // Fetch profiles with digest enabled matching today's frequency
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .eq("email_digest_enabled", true)
    .in("email_digest_frequency", frequencies);

  if (profilesError) {
    return NextResponse.json(
      { error: profilesError.message },
      { status: 500 }
    );
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ message: "No subscribers", sent: 0 });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const profile of profiles) {
    try {
      // Fetch this user's expenses
      const { data: expenses } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", profile.id)
        .order("date_of_service", { ascending: false });

      if (!expenses) continue;

      // Calculate period boundaries
      const periodStart = new Date();
      if (profile.email_digest_frequency === "monthly") {
        periodStart.setMonth(periodStart.getMonth() - 1);
      } else {
        periodStart.setDate(periodStart.getDate() - 7);
      }

      const periodLabel =
        profile.email_digest_frequency === "monthly"
          ? now.toLocaleDateString("en-US", { month: "long", year: "numeric" })
          : `Week of ${periodStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

      // Period metrics
      const newExpenses = expenses.filter(
        (e: { created_at: string }) =>
          new Date(e.created_at) >= periodStart
      );
      const reimbursedThisPeriod = expenses
        .filter(
          (e: { reimbursed: boolean; reimbursed_date: string | null }) =>
            e.reimbursed &&
            e.reimbursed_date &&
            new Date(e.reimbursed_date + "T00:00:00") >= periodStart
        )
        .reduce(
          (sum: number, e: { reimbursed_amount: number | null; amount: number }) =>
            sum + (e.reimbursed_amount ?? e.amount),
          0
        );

      const totalExpenses = expenses.reduce(
        (sum: number, e: { amount: number }) => sum + e.amount,
        0
      );
      const totalReimbursed = expenses
        .filter((e: { reimbursed: boolean }) => e.reimbursed)
        .reduce(
          (sum: number, e: { reimbursed_amount: number | null; amount: number }) =>
            sum + (e.reimbursed_amount ?? e.amount),
          0
        );
      const pendingReimbursement = totalExpenses - totalReimbursed;

      const annualReturn = profile.expected_annual_return ?? 7;
      const timeHorizon = profile.time_horizon_years ?? 20;
      const { extraGrowth } = calculateExpectedReturn(
        expenses,
        annualReturn,
        timeHorizon
      );

      const auditReadyCount = expenses.filter((e: { receipt_urls: string[]; eob_urls: string[]; invoice_urls: string[] }) =>
        isAuditReady(e)
      ).length;
      const auditReadyPct =
        expenses.length > 0
          ? Math.round((auditReadyCount / expenses.length) * 100)
          : 100;

      const topExpenses = expenses.slice(0, 5).map((e: { description: string; amount: number; date_of_service: string }) => ({
        description: e.description,
        amount: e.amount,
        date: new Date(e.date_of_service + "T00:00:00").toLocaleDateString(
          "en-US",
          { month: "short", day: "numeric" }
        ),
      }));

      const emailHtml = await renderEmailToHtml(
        DigestEmail({
          firstName: profile.first_name || "there",
          periodLabel,
          hsaBalance: profile.current_hsa_balance ?? 0,
          totalExpenses,
          pendingReimbursement,
          newExpenseCount: newExpenses.length,
          reimbursedThisPeriod,
          projectedGrowth: extraGrowth,
          timeHorizon,
          annualReturn,
          auditReadyPct,
          topExpenses,
        })
      );

      await resend.emails.send({
        from: EMAIL_FROM,
        to: profile.email,
        subject: `Your HSA Plus ${periodLabel} Summary`,
        html: emailHtml,
      });

      sent++;
    } catch (err) {
      console.error(`Failed to send digest to ${profile.email}:`, err);
      errors.push(profile.email);
    }
  }

  return NextResponse.json({
    message: `Sent ${sent} digest(s)`,
    sent,
    errors: errors.length > 0 ? errors : undefined,
  });
}

// Simple React-to-HTML renderer (using react-dom/server)
async function renderEmailToHtml(element: React.ReactElement): Promise<string> {
  const ReactDOMServer = await import("react-dom/server");
  return ReactDOMServer.renderToStaticMarkup(element);
}

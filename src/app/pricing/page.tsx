import { createClient } from "@/lib/supabase/server";
import { PricingContent } from "@/components/pricing-content";
import type { PlanType } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — HSA Plus",
  description:
    "Free forever with 10 expenses. Upgrade to Plus for unlimited tracking, dependents, AI receipt scanning, and more.",
};

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let planType: PlanType = "free";
  let isLoggedIn = false;

  if (user) {
    isLoggedIn = true;
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_type")
      .eq("id", user.id)
      .single();
    planType = (profile?.plan_type as PlanType) ?? "free";
  }

  return <PricingContent planType={planType} isLoggedIn={isLoggedIn} />;
}

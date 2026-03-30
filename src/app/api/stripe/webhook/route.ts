import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

function supabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

async function updateProfile(
  customerId: string,
  fields: Record<string, string>
) {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("profiles")
    .update(fields)
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Failed to update profile:", error);
  }
}

function mapSubscriptionStatus(
  status: Stripe.Subscription.Status
): string {
  const mapping: Record<string, string> = {
    active: "active",
    trialing: "trialing",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "past_due",
    incomplete: "inactive",
    incomplete_expired: "inactive",
    paused: "inactive",
  };
  return mapping[status] ?? "inactive";
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.customer && session.subscription) {
        await updateProfile(session.customer as string, {
          plan_type: "plus",
          subscription_status: "active",
          stripe_subscription_id: session.subscription as string,
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const fields: Record<string, string> = {
        subscription_status: mapSubscriptionStatus(subscription.status),
      };
      if (
        subscription.status === "active" ||
        subscription.status === "trialing"
      ) {
        fields.plan_type = "plus";
      }
      await updateProfile(subscription.customer as string, fields);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await updateProfile(subscription.customer as string, {
        plan_type: "free",
        subscription_status: "canceled",
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.customer) {
        await updateProfile(invoice.customer as string, {
          subscription_status: "past_due",
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

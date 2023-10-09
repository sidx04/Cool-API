import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import { apiBaseUrl } from "next-auth/client/_utils";
import { subscribe } from "diagnostics_channel";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

export const stripe = new Stripe(String(process.env.STRIPE_SECRET), {
  apiVersion: "2023-08-16",
});

export async function hasSubscription() {
  const session = getServerSession(authOptions);

  if (session) {
    const user = await prisma.user.findFirst({
      where: { email: session.user?.email },
    });

    const subscriptions = await stripe.subscriptions.list({
      customer: String(user?.stripe_customer_id),
    });

    return subscriptions.data.length > 0;
  }

  return false;
}

export async function createCheckOutLink(customer: string) {
  const checkout = await stripe.checkout.sessions.create({
    success_url: "http://localhost:3000/dashboard/billing?success=true",
    cancel_url: "http://localhost:3000/dashboard/billing?success=false",
    customer: customer,
    line_items: [
      {
        price: "price_1NzCHTSJSpvvQFm16Mzo3cLx",
      },
    ],
    mode: "subscription",
  });

  return checkout.url;
}

export async function createCustomerIfNull() {
  const session = getServerSession(authOptions);

  if (session) {
    const user = await prisma.user.findFirst({
      where: { email: session.user?.email },
    });

    if (!user?.api_key) {
      await prisma.user.update({
        where: {
          id: user?.id,
        },
        data: {
          api_key: "secretkey_" + randomUUID(),
        },
      });
    }

    if (!user?.stripe_customer_id) {
      const customer = await stripe.customers.create({
        email: String(user?.email),
      });

      await prisma.user.update({
        where: {
          id: user?.id,
        },
        data: {
          stripe_customer_id: customer.id,
        },
      });
    }
    const userRedirect = await prisma.user.findFirst({
      where: { email: session.user?.email },
    });

    return userRedirect?.stripe_customer_id;
  }
}

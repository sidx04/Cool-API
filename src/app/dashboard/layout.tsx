import { Header } from "@/components/header";
import { isLoggedIn } from "@/lib/auth";
import { createCustomerIfNull, hasSubscription } from "@/lib/stripe";
import React from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await isLoggedIn();
  await createCustomerIfNull();

  const hasSub = await hasSubscription();
  console.log(hasSub ? "has subscription" : "no subscription");

  return (
    <div className="">
      <Header />
      <div className="max-w-5xl m-auto w-full">{children}</div>
    </div>
  );
}

import { Header } from "@/components/header";
import { isLoggedIn } from "@/lib/auth";
import {
  createCheckOutLink,
  createCustomerIfNull,
  hasSubscription,
} from "@/lib/stripe";
import React from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await isLoggedIn();
    
  return (
    <div className="">
      <Header />
      <div className="max-w-5xl m-auto w-full">{children}</div>
    </div>
  );
}

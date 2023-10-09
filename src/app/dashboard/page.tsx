import {
  createCheckOutLink,
  createCustomerIfNull,
  hasSubscription,
} from "@/lib/stripe";
import Link from "next/link";

export default async function Page() {
  const customer = await createCustomerIfNull();

  const hasSub = await hasSubscription();
  const checkOutLink = await createCheckOutLink(String(customer));

  return (
    <main>
      {hasSub ? (
        <>
          <div className="px-4 py-2 bg-emerald-400 font-medium text-yellow-50 rounded-md">
            You are subscribed!
          </div>
        </>
      ) : (
        <>
          <div className="min-h-[60vh] grid place-items-center rounded-lg px-6 py-10 bg-slate-200">
            <Link
              href={String(checkOutLink)}
              className="font-medium text-base hover:opacity-70"
            >
              You have no subscription, check out now!
            </Link>
          </div>
        </>
      )}
    </main>
  );
}

import {
  createCheckOutLink,
  createCustomerIfNull,
  hasSubscription,
  stripe,
} from "@/lib/stripe";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function Page() {
  const session = await getServerSession(authOptions);

  const customer = await createCustomerIfNull();

  const hasSub = await hasSubscription();
  const checkOutLink = await createCheckOutLink(String(customer));

  const prisma = new PrismaClient();

  const user = await prisma.user.findFirst({
    where: {
      email: session?.user?.email,
    },
  });
  const recentLogs = await prisma.log.findMany({
    where: {
      userId: user?.id,
    },
    orderBy: {
      created: "desc",
    },
    take: 10,
  });

  let current_usage = 0;

  if (hasSub) {
    const subscriptions = await stripe.subscriptions.list({
      customer: String(user?.stripe_customer_id),
    });

    const invoice = await stripe.invoices.retrieveUpcoming({
      subscription: subscriptions.data.at(0)?.id,
    });

    current_usage = invoice.amount_due;
  }

  return (
    <main>
      {hasSub ? (
        <>
          <div className="flex flex-col gap-4">
            <div className="px-4 py-2 bg-emerald-400 font-medium text-yellow-50 rounded-md">
              You are subscribed!
            </div>

            <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-md">
              <p className="text-sm text-black px-6 py-4 font-medium">
                Current Usage
              </p>
              <p className="text-sm font-mono text-zinc-800 px-6 py-4">
                {current_usage / 100}
              </p>
            </div>

            <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-md">
              <p className="text-sm text-black px-6 py-4 font-medium">
                API Key
              </p>
              <p className="text-sm font-mono text-zinc-800 px-6 py-4">
                {user?.api_key}
              </p>
            </div>

            <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-md">
              <p className="text-sm text-black px-6 py-4 font-medium">Logs</p>
              <p className="text-sm font-mono text-zinc-800 px-6 py-4">
                {recentLogs.map((item, index) => (
                  <div className="flex items-center gap-4" key={index}>
                    <p className="text-sm font-mono text-zinc-800 px-6 py-4">
                      {item.method}
                    </p>
                    <p className="text-sm font-mono text-zinc-800 px-6 py-4">
                      {item.status}
                    </p>
                    <p className="text-sm font-mono text-zinc-800 px-6 py-4">
                      {item.created.toDateString()}
                    </p>
                  </div>
                ))}
              </p>
            </div>
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

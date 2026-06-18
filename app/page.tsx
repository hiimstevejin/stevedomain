import { auth } from "@/auth";
import { UserMenu } from "@/components/UserMenu";
import { Dashboard } from "@/components/dashboard/Dashboard";

export default async function Home() {
  const session = await auth();
  const user = session?.user;
  const firstName = user?.name?.split(" ")[0];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-7 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="bg-blush flex h-11 w-11 items-center justify-center rounded-2xl text-2xl"
            aria-hidden
          >
            🌸
          </span>
          <div>
            <h1 className="text-cocoa text-xl font-bold leading-tight">
              Study Nook
            </h1>
            <p className="text-cocoa-soft text-sm">
              {firstName ? `Welcome back, ${firstName}.` : "Welcome back."} Let’s
              focus.
            </p>
          </div>
        </div>
        <UserMenu name={user?.name} image={user?.image} />
      </header>

      <Dashboard />
    </main>
  );
}

import { DeFiDcfDashboard } from "@/components/DeFiDcfDashboard";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <DeFiDcfDashboard />
      </main>
    </div>
  );
}

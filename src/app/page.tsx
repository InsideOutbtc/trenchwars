import Header from "@/components/Header";
import WarsDashboard from "@/components/WarsDashboard";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--midnight-black)] relative">
      <Header />
      <main className="relative z-10">
        <Hero />
        <WarsDashboard />
      </main>
    </div>
  );
}
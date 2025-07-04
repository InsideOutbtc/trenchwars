import Header from "@/components/Header";
import WarsDashboard from "@/components/WarsDashboard";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Header />
      <main>
        <Hero />
        <WarsDashboard />
      </main>
    </div>
  );
}
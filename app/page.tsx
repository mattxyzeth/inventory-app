import { InventoryApp } from "@/components/InventoryApp";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Inventory Order
        </h1>
        <InventoryApp />
      </div>
    </main>
  );
}

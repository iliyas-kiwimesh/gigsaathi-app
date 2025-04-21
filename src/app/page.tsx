import { DataTable } from "../components/DataTable";

export default function Home() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">User Data</h1>
      <DataTable />
    </main>
  );
}

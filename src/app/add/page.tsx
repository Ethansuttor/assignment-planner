import Nav from "@/components/nav";
import UploadForm from "@/components/upload-form";

export default function AddPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold">Add assignment</h1>
        <UploadForm />
      </main>
    </div>
  );
}

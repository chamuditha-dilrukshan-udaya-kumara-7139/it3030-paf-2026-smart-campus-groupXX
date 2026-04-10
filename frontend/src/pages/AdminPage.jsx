function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="mt-2 text-slate-600">This page is only accessible to ADMIN users.</p>
      </div>
    </main>
  );
}

export default AdminPage;

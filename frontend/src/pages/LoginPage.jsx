function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-slate-800">Login</h1>
        <p className="text-slate-600 mt-2">Use Google to sign in to Smart Campus.</p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
}

export default LoginPage;

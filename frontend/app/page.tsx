import Link from "next/link";

export default function Landing() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center p-6">
      <h1 className="text-5xl font-bold mb-6">
        AI Job Assistant 🚀
      </h1>

      <p className="text-gray-400 max-w-xl mb-10">
        Discover jobs tailored to your skills, generate AI-powered cover letters,
        and track your applications — all in one intelligent platform.
      </p>

      <div className="flex gap-6">
        <Link href="/login" className="bg-blue-600 px-6 py-3 rounded font-semibold">
          Login
        </Link>

        <Link href="/signup" className="bg-gray-700 px-6 py-3 rounded font-semibold">
          Sign Up
        </Link>
      </div>
    </main>
  );
}
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [apps, setApps] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");

    const payload = JSON.parse(atob(token!.split(".")[1]));
    setEmail(payload.sub);

    const load = async () => {
      const res = await fetch("http://127.0.0.1:8000/applications/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setApps(data);
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-10 space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <div className="bg-gray-900 p-6 rounded">
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Total Applications:</strong> {apps.length}</p>
      </div>

      <button
        onClick={() => router.push("/dashboard")}
        className="bg-blue-600 px-4 py-2 rounded"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
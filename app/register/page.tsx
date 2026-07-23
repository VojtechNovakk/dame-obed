import { Suspense } from "react";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-[100dvh] w-full bg-neutral-950 flex items-center justify-center relative overflow-hidden p-4">
      {/* Ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}

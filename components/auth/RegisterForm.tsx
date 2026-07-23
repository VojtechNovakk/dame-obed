"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { UserPlus, ArrowRight, Loader2 } from "lucide-react";
import { registerUser } from "@/lib/actions";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Hesla se neshodují.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await registerUser(formData);
      
      if (res.error) {
        setError(res.error);
        setIsLoading(false);
      } else {
        // Automaticky přihlásit uživatele
        const signInRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        
        if (signInRes?.error) {
          router.push("/login?registered=true");
        } else {
          router.push("/");
          router.refresh();
        }
      }
    } catch {
      setError("Něco se pokazilo. Zkuste to znovu.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl bg-neutral-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl relative z-10">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
          <UserPlus size={28} className="text-emerald-400" />
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Vytvořit účet</h2>
        <p className="text-neutral-400 text-sm">Připojte se k nám a získejte přístup ke všem funkcím.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5 ml-1">E-mail</label>
          <input 
            type="email" 
            name="email"
            required
            placeholder="vas@email.cz"
            className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5 ml-1">Uživatelské jméno</label>
          <input 
            type="text" 
            name="username"
            required
            placeholder="Karel Omáčka"
            className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5 ml-1">Heslo</label>
          <input 
            type="password" 
            name="password"
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5 ml-1">Potvrzení hesla</label>
          <input 
            type="password" 
            name="confirmPassword"
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl bg-neutral-800/50 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex justify-center items-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
            <>
              Zaregistrovat se
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-neutral-400">
        Už máte účet?{' '}
        <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
          Přihlaste se
        </Link>
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { sendSuggestion } from "@/app/actions/suggest";

export default function SuggestForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg("");
    
    const result = await sendSuggestion(name, url);
    
    setIsLoading(false);
    if (result.success) {
      setSuccessMsg("Tip úspěšně odeslán, díky!");
      setName("");
      setUrl("");
      setTimeout(() => {
        setIsOpen(false);
        setSuccessMsg("");
      }, 3000);
    } else {
      alert(result.error || "Došlo k chybě při odesílání.");
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {isOpen ? (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-2xl w-80 border border-gray-100 dark:border-neutral-800 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-neutral-100">Přidat restauraci</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          {successMsg ? (
            <div className="text-emerald-600 dark:text-emerald-400 font-medium text-center py-4">
              {successMsg}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                  Název restaurace
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-neutral-100 bg-white dark:bg-neutral-800"
                  placeholder="U Dvou koček"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                  Odkaz na web
                </label>
                <input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-neutral-100 bg-white dark:bg-neutral-800"
                  placeholder="https://..."
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-2"
              >
                {isLoading ? "Odesílám..." : "Odeslat tip"}
              </button>
            </form>
          )}

        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
          aria-label="Navrhnout restauraci"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}

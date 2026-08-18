import React, { useState } from "react";
import { Zap } from "lucide-react";
import { useAuth } from "../hooks/AuthContext";

interface AuthScreenProps {
 onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
 const { signIn, signUp, signInWithGoogle } = useAuth();
 const [mode, setMode] = useState<"login" | "signup">("login");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [name, setName] = useState("");
 const [handle, setHandle] = useState("");
 const [error, setError] = useState<string | null>(null);
 const [busy, setBusy] = useState(false);
 const [googleBusy, setGoogleBusy] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError(null);
 setBusy(true);
 try {
 if (mode === "login") {
 await signIn(email, password);
 } else {
 await signUp(email, password, name, handle);
 }
 } catch (err: any) {
 setError(err.message || "Something went wrong");
 } finally {
 setBusy(false);
 }
 };

 const handleGoogle = async () => {
 setError(null);
 setGoogleBusy(true);
 try {
 await signInWithGoogle();
 onSuccess?.();
 } catch (err: any) {
 setError(err.message || "Something went wrong");
 } finally {
 setGoogleBusy(false);
 }
 };

 return (
 <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
 <div className="w-full max-w-sm bg-[#18181B] border border-[#27272A] rounded-2xl p-6 space-y-5">
 <div className="flex items-center justify-center space-x-2">
 <div className="w-10 h-10 rounded-full bg-[#E6FF00] flex items-center justify-center text-[#0A0A0A]">
 <Zap className="w-5 h-5 fill-current" />
 </div>
 <span className="text-2xl font-black text-white tracking-wider">SEKAA</span>
 </div>

 <button
 onClick={handleGoogle}
 disabled={googleBusy}
 className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-white hover:bg-gray-100 disabled:opacity-50 text-[#0A0A0A] font-bold text-xs uppercase tracking-wider transition-all"
 >
 <svg className="w-4 h-4" viewBox="0 0 48 48">
 <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z"/>
 <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.4 18.9 12 24 12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3c-7.7 0-14.3 4.4-17.7 10.7z"/>
 <path fill="#4CAF50" d="M24 45c5.4 0 10.3-1.8 14.1-5l-6.5-5.5C29.6 36 26.9 37 24 37c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.6 40.5 16.2 45 24 45z"/>
 <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.7l6.5 5.5C41.4 36 45 30.6 45 24c0-1.2-.1-2.4-.4-3.5z"/>
 </svg>
 {googleBusy ? "Please wait..." : "Continue with Google"}
 </button>

 <div className="flex items-center gap-3">
 <div className="flex-1 h-px bg-[#27272A]" />
 <span className="text-[10px] text-[#71717A] uppercase tracking-wider">or</span>
 <div className="flex-1 h-px bg-[#27272A]" />
 </div>

 <form onSubmit={handleSubmit} className="space-y-3">
 {mode === "signup" && (
 <>
 <input
 type="text"
 placeholder="Display name"
 value={name}
 onChange={(e) => setName(e.target.value)}
 required
 className="w-full bg-[#27272A] text-white text-xs px-4 py-3 rounded-xl border border-[#27272A] focus:outline-none focus:border-[#E6FF00]"
 />
 <input
 type="text"
 placeholder="Handle (e.g. memelord_99)"
 value={handle}
 onChange={(e) => setHandle(e.target.value)}
 required
 className="w-full bg-[#27272A] text-white text-xs px-4 py-3 rounded-xl border border-[#27272A] focus:outline-none focus:border-[#E6FF00]"
 />
 </>
 )}
 <input
 type="email"
 placeholder="Email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 className="w-full bg-[#27272A] text-white text-xs px-4 py-3 rounded-xl border border-[#27272A] focus:outline-none focus:border-[#E6FF00]"
 />
 <input
 type="password"
 placeholder="Password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 required
 minLength={6}
 className="w-full bg-[#27272A] text-white text-xs px-4 py-3 rounded-xl border border-[#27272A] focus:outline-none focus:border-[#E6FF00]"
 />

 {error && <p className="text-xs text-[#FF3366] font-semibold">{error}</p>}

 <button
 type="submit"
 disabled={busy}
 className="w-full py-3 rounded-full bg-[#E6FF00] hover:bg-[#d8f000] disabled:opacity-50 text-[#0A0A0A] font-black text-xs uppercase tracking-wider transition-all"
 >
 {busy ? "Please wait..." : mode === "login" ? "Log In" : "Sign Up"}
 </button>
 </form>

 <button
 onClick={() => setMode(mode === "login" ? "signup" : "login")}
 className="w-full text-center text-xs text-[#A1A1AA] hover:text-white"
 >
 {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
 </button>
 </div>
 </div>
 );
};




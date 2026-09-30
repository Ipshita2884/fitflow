import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative px-4 overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-positive/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="absolute top-6 left-6">
        <Link href="/" className="text-accent font-bold tracking-widest uppercase text-sm">
          FitFlow
        </Link>
      </div>

      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  );
}

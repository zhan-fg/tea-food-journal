import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <h1 className="text-6xl font-bold text-tea-300 dark:text-tea-700 mb-4">404</h1>
      <h2 className="text-xl font-semibold text-foreground mb-2">页面未找到</h2>
      <p className="text-foreground/50 mb-8">这个配方可能还在实验中...</p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-full bg-tea-500 text-white hover:bg-tea-600 transition-colors"
      >
        回到首页
      </Link>
    </div>
  );
}

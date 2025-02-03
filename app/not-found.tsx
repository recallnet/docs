import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold">Page not found</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-black px-4 py-2 text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

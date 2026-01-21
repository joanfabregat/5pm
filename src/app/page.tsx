import CountdownClock from "./components/CountdownClock";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center justify-center">
        <CountdownClock />
      </main>
    </div>
  );
}

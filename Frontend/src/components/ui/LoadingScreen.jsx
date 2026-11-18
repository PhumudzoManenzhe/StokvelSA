import BrandMark from "./BrandMark";

/**
 * Shown while the session is being restored, so it is the first thing anyone
 * sees on a cold load. A neutral spinner would do, but the mark matters here:
 * it is the difference between "someone's website is loading" and "your
 * stokvel is opening".
 */
export default function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-stone-50">
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-600 text-white">
          <BrandMark size={30} className="animate-pulse" />
        </div>
        <p className="mt-4 text-sm text-stone-500">Opening your stokvel…</p>
      </div>
    </div>
  );
}

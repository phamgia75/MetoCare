/**
 * Non-production environment banner.
 *
 * `app.metocare.me` currently resolves to the STAGING Container App, so the owner
 * was reviewing staging while reasoning about it as production — which is what
 * produced the "the medication UI still looks unchanged" report. Until the
 * environment split lands (docs/launch-readiness/16), the only reliable signal a
 * viewer has is the page itself saying so.
 *
 * Deliberately BUILD-TIME (`NEXT_PUBLIC_*`), not fetched from `/api/v1/info`:
 * the banner must still be correct when the API is down or slow, and a page must
 * never render "looks like production" while the backend says otherwise. It
 * renders nothing at all in a production build.
 *
 * The short SHA is included so any screenshot identifies its own build — the
 * question that previously had to be answered by hashing JS chunks.
 *
 * The banner states the ENVIRONMENT unconditionally, but claims the DATA is
 * synthetic only when the build was told so. It used to assert
 * "dữ liệu ở đây không phải dữ liệu thật" in every non-production build, which
 * was false in at least two of them: staging accumulated 90 self-registered
 * real accounts before the synthetic-only lock (see
 * `app/core/config.py::synthetic_only_mode`), and the app.metocare.me demo
 * serves the restored production database. Telling a viewer that real patient
 * names and lab results are fake is worse than saying nothing about the data
 * at all, so the claim is now opt-in via NEXT_PUBLIC_DATA_IS_SYNTHETIC and the
 * default is silence.
 */

const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV ?? ''
const BUILD_SHA = process.env.NEXT_PUBLIC_BUILD_SHA ?? ''
const DATA_IS_SYNTHETIC = process.env.NEXT_PUBLIC_DATA_IS_SYNTHETIC ?? ''

/** Environments that must NOT show the banner. Anything else is non-production. */
const PRODUCTION_ENVS = new Set(['production', 'prod'])

export function isNonProductionBuild(appEnv: string = APP_ENV): boolean {
  // An UNSET value is treated as non-production on purpose: forgetting to bake
  // the variable must not silently make staging look like production.
  return !PRODUCTION_ENVS.has(appEnv.trim().toLowerCase())
}

/**
 * Whether this build may claim its data is synthetic. Unset = no claim, because
 * an unbaked variable must never produce a false statement about real records —
 * the inverse of the `isNonProductionBuild` default, and for the same reason.
 */
export function claimsSyntheticData(flag: string = DATA_IS_SYNTHETIC): boolean {
  return flag.trim().toLowerCase() === 'true'
}

export function EnvironmentBanner() {
  if (!isNonProductionBuild()) return null

  const label = APP_ENV.trim() || 'không xác định'

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-50 w-full bg-[#8B6400] px-3 py-1.5 text-center text-[12.5px] font-semibold text-white"
    >
      MÔI TRƯỜNG THỬ NGHIỆM ({label})
      {claimsSyntheticData() ? ' — dữ liệu ở đây không phải dữ liệu thật.' : null}
      {BUILD_SHA ? <span className="ml-2 font-mono opacity-80">{BUILD_SHA}</span> : null}
    </div>
  )
}

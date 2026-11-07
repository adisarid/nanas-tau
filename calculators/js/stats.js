// Small statistics helpers for the client-side calculators (no dependencies).
// Works in the browser (window.NanasStats) and in Node (require) for testing.
(function (root) {
  "use strict";

  // Seeded PRNG (mulberry32): the same seed gives the same sample.
  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Standard normal draw (Box–Muller).
  function rnorm(r) {
    let u = 0;
    while (u === 0) u = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
  }

  // log Γ(x), Lanczos approximation.
  const LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  function lgamma(x) {
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
    x -= 1;
    let a = LANCZOS[0];
    const t = x + 7.5;
    for (let i = 1; i < 9; i++) a += LANCZOS[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }

  // Continued fraction for the regularized incomplete beta (Numerical Recipes, Lentz).
  function betacf(a, b, x) {
    const FPMIN = 1e-300;
    const qab = a + b, qap = a + 1, qam = a - 1;
    let c = 1, d = 1 - (qab * x) / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= 500; m++) {
      const m2 = 2 * m;
      let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d; h *= d * c;
      aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < 1e-15) break;
    }
    return h;
  }

  function ibeta(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? (bt * betacf(a, b, x)) / a : 1 - (bt * betacf(b, a, 1 - x)) / b;
  }

  // Student t CDF and quantile (R's pt / qt).
  function pt(t, df) {
    const tail = 0.5 * ibeta(df / (df + t * t), df / 2, 0.5);
    return t > 0 ? 1 - tail : tail;
  }

  function qt(p, df) {
    if (p === 0.5) return 0;
    if (p < 0.5) return -qt(1 - p, df);
    let lo = 0, hi = 1;
    while (pt(hi, df) < p) { lo = hi; hi *= 2; }
    for (let i = 0; i < 200 && hi - lo > 1e-12 * hi; i++) {
      const mid = (lo + hi) / 2;
      if (pt(mid, df) < p) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  // Simple linear regression w = b0 + b1 z. Returns null when z has no spread.
  function slr(z, w) {
    const n = z.length;
    let zbar = 0, wbar = 0;
    for (let i = 0; i < n; i++) { zbar += z[i]; wbar += w[i]; }
    zbar /= n; wbar /= n;
    let Szz = 0, Szw = 0, Sww = 0;
    for (let i = 0; i < n; i++) {
      const dz = z[i] - zbar, dw = w[i] - wbar;
      Szz += dz * dz; Szw += dz * dw; Sww += dw * dw;
    }
    if (Szz < 1e-12 * n) return null;
    const b1 = Szw / Szz, b0 = wbar - b1 * zbar;
    const sse = Math.max(Sww - b1 * Szw, 0);
    const df = n - 2;
    return { n, df, b0, b1, zbar, Szz, sse, sigma: Math.sqrt(sse / df), r2: Sww > 0 ? 1 - sse / Sww : 1 };
  }

  const api = { rng, rnorm, lgamma, ibeta, pt, qt, slr };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NanasStats = api;
})(typeof self !== "undefined" ? self : this);

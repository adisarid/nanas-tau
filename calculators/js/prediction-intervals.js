// Confidence vs. prediction intervals: client-side port of
// https://github.com/adisarid/prediction_confidence_intervals_demo (Shiny).
// The math lives in compute(); the browser part draws with ECharts.
(function (root) {
  "use strict";
  const S = typeof module !== "undefined" && module.exports ? require("./stats.js") : root.NanasStats;

  // Same values as nanas_pal in R/setup.R.
  const PAL = { primary: "#2B59C3", accent: "#E4572E", sky: "#56B4E9", grey: "#8A8F98" };
  const MAX_N = 1000, GRID = 201;

  // g: regressor transform; fwd/back: response transform; truth: E-scale true curve.
  const MODELS = {
    linear: {
      g: (x) => x, fwd: (y) => y, back: (v) => v,
      truth: (x, a, b) => a + b * x,
      draw: (x, a, b, e) => a + b * x + e,
    },
    log_linear: {
      g: (x) => x, fwd: Math.log, back: Math.exp,
      truth: (x, a, b) => Math.exp(a + b * x),
      draw: (x, a, b, e) => Math.exp(a + b * x + e),
    },
    sine: {
      g: Math.sin, fwd: (y) => y, back: (v) => v,
      truth: (x, a, b) => a + b * Math.sin(x),
      draw: (x, a, b, e) => a + b * Math.sin(x) + e,
    },
  };

  // Fixed random draws per seed, so moving a slider changes only what it controls.
  function draws(seed) {
    const r = S.rng(seed), u = new Float64Array(MAX_N), z = new Float64Array(MAX_N);
    for (let i = 0; i < MAX_N; i++) { u[i] = r(); z[i] = S.rnorm(r); }
    return { u, z };
  }

  function compute(p, d) {
    const m = MODELS[p.model];
    const n = Math.min(p.n, MAX_N);
    const xs = [], ys = [];
    for (let i = 0; i < n; i++) {
      const x = p.xmin + d.u[i] * (p.xmax - p.xmin);
      xs.push(x);
      ys.push(m.draw(x, p.a, p.b, p.sigma * d.z[i]));
    }
    const fit = S.slr(xs.map(m.g), ys.map(m.fwd));
    if (!fit || !ys.every(Number.isFinite)) return { xs, ys, fit: null };

    const pad = p.extrapolate ? 0.4 * (p.xmax - p.xmin) : 0;
    const lo = p.xmin - pad, hi = p.xmax + pad;
    const t = S.qt(1 - (1 - p.level) / 2, fit.df);
    const g = { x: [], truth: [], fit: [], ciL: [], ciU: [], piL: [], piU: [] };
    for (let k = 0; k < GRID; k++) {
      const x = lo + ((hi - lo) * k) / (GRID - 1);
      const z0 = m.g(x), yhat = fit.b0 + fit.b1 * z0;
      const h = 1 / fit.n + ((z0 - fit.zbar) ** 2) / fit.Szz;
      const ci = t * fit.sigma * Math.sqrt(h), pi = t * fit.sigma * Math.sqrt(1 + h);
      g.x.push(x);
      g.truth.push(m.truth(x, p.a, p.b));
      g.fit.push(m.back(yhat));
      g.ciL.push(m.back(yhat - ci)); g.ciU.push(m.back(yhat + ci));
      g.piL.push(m.back(yhat - pi)); g.piU.push(m.back(yhat + pi));
    }
    return { xs, ys, fit, t, grid: g, lo, hi };
  }

  // ---------------------------------------------------------------- browser
  if (typeof document === "undefined") {
    module.exports = { compute, draws, MODELS };
    return;
  }

  const fmt = (v, d = 3) => (Number.isFinite(v) ? (+v.toPrecision(d + 1)).toLocaleString("en-US", { maximumFractionDigits: d }) : "–");

  function init() {
    const el = document.getElementById("pici-calc");
    if (!el || !window.echarts) return;
    const $ = (id) => document.getElementById("pici-" + id);
    const chart = echarts.init($("chart"), null, { renderer: "canvas" });
    let seed = 2026, d = draws(seed);

    function params() {
      let xmin = +$("xmin").value, xmax = +$("xmax").value;
      if (xmax - xmin < 0.1) { xmax = Math.min(10, xmin + 0.1); xmin = xmax - 0.1; }
      return {
        model: $("model").value, a: +$("a").value || 0, b: +$("b").value || 0,
        xmin, xmax, n: +$("n").value, sigma: +$("sigma").value,
        level: +$("level").value, extrapolate: $("extrap").checked,
      };
    }

    function theme() {
      const dark = document.body.classList.contains("quarto-dark");
      return { text: dark ? "#e6e6e6" : "#222", muted: dark ? "#9aa0a6" : "#666", grid: dark ? "#3a3f45" : "#e5e5e5", truth: dark ? "#f2f2f2" : "#111" };
    }

    function band(name, x, lower, upper, color, opacity) {
      return {
        name, type: "custom", z: 1, silent: true,
        itemStyle: { color, opacity },
        data: x.map((v, i) => [v, lower[i], upper[i]]),
        encode: { x: 0, y: [1, 2] },
        renderItem(prm, api) {
          if (prm.dataIndex !== 0) return null;
          const top = x.map((v, i) => api.coord([v, upper[i]]));
          const bot = x.map((v, i) => api.coord([v, lower[i]])).reverse();
          return { type: "polygon", shape: { points: top.concat(bot) }, style: { fill: color, opacity } };
        },
      };
    }

    function rCode(p) {
      const lvl = p.level, a = p.a, b = p.b;
      const gen = {
        linear: `y <- ${a} + ${b} * x + rnorm(n, sd = ${p.sigma})\nfit <- lm(y ~ x)`,
        log_linear: `y <- exp(${a} + ${b} * x + rnorm(n, sd = ${p.sigma}))\nfit <- lm(log(y) ~ x)        # הרגרסיה על log(y)`,
        sine: `y <- ${a} + ${b} * sin(x) + rnorm(n, sd = ${p.sigma})\nfit <- lm(y ~ sin(x))        # לינארי במקדמים, לא ב-x`,
      }[p.model];
      const lo = +(p.xmin - (p.extrapolate ? 0.4 * (p.xmax - p.xmin) : 0)).toFixed(2);
      const hi = +(p.xmax + (p.extrapolate ? 0.4 * (p.xmax - p.xmin) : 0)).toFixed(2);
      const wrap = p.model === "log_linear" ? (s) => `exp(${s})        # חזרה לסקאלה של y` : (s) => s;
      return [
        "set.seed(2026)",
        `n <- ${p.n}`,
        `x <- runif(n, ${p.xmin}, ${p.xmax})`,
        gen,
        "summary(fit)",
        "",
        `new_x <- data.frame(x = seq(${lo}, ${hi}, length.out = 200))`,
        wrap(`predict(fit, new_x, interval = "confidence", level = ${lvl})`),
        wrap(`predict(fit, new_x, interval = "prediction", level = ${lvl})`),
      ].join("\n");
    }

    function render() {
      const p = params();
      $("xmin-out").textContent = p.xmin.toFixed(1);
      $("xmax-out").textContent = p.xmax.toFixed(1);
      $("n-out").textContent = p.n;
      $("sigma-out").textContent = p.sigma.toFixed(1);
      $("rcode").textContent = rCode(p);

      const res = compute(p, d);
      const warn = $("warn");
      if (!res.fit) {
        warn.hidden = false;
        warn.textContent = p.model === "sine"
          ? "בטווח הזה sin(x) כמעט קבוע, ולכן אי אפשר לאמוד את השיפוע. הרחיבו את טווח ה-x."
          : "אי אפשר לאמוד את המודל עם הערכים האלה. שנו את הפרמטרים.";
        chart.clear();
        return;
      }
      warn.hidden = true;
      const f = res.fit, g = res.grid, th = theme();
      const pct = Math.round(p.level * 100) + "%";

      // Summary numbers: widths at x̄ (narrowest for linear) and at the data's right edge.
      const at = (x) => {
        let k = 0;
        for (let i = 1; i < g.x.length; i++) if (Math.abs(g.x[i] - x) < Math.abs(g.x[k] - x)) k = i;
        return k;
      };
      const xbar = res.xs.reduce((s, v) => s + v, 0) / res.xs.length;
      const kc = at(xbar), ke = at(p.xmax);
      const stats = [
        ["גודל המדגם <span class=\"en\">n</span>", f.n],
        ["דרגות חופש <span class=\"en\">n − 2</span>", f.df],
        ["חותך <span class=\"en\">b̂₀</span>", fmt(f.b0)],
        ["שיפוע <span class=\"en\">b̂₁</span>", fmt(f.b1)],
        ["סטיית תקן של השאריות <span class=\"en\">σ̂</span>", fmt(f.sigma)],
        ["<span class=\"en\">R²</span>", fmt(f.r2)],
        [`ערך קריטי <span class="en">t(${1 - (1 - p.level) / 2}, ${f.df})</span>`, fmt(res.t)],
        [`רוחב רווח הסמך בממוצע, <span class="en">x̄ = ${fmt(xbar, 2)}</span>`, fmt(g.ciU[kc] - g.ciL[kc])],
        ["רוחב רווח החיזוי בממוצע", fmt(g.piU[kc] - g.piL[kc])],
        [`רוחב רווח הסמך בקצה, <span class="en">x = ${fmt(p.xmax, 2)}</span>`, fmt(g.ciU[ke] - g.ciL[ke])],
        ["רוחב רווח החיזוי בקצה", fmt(g.piU[ke] - g.piL[ke])],
      ];
      $("stats").innerHTML = `<table class="table table-sm calc-stats"><tbody>${stats.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("")}</tbody></table>`;
      $("level-txt").textContent = pct;

      const line = (name, data, color, width, extra = {}) => ({
        name, type: "line", data: g.x.map((x, i) => [x, data[i]]), symbol: "none",
        lineStyle: { color, width }, itemStyle: { color }, z: 3, ...extra,
      });

      const series = [
        band("רווח חיזוי", g.x, g.piL, g.piU, PAL.sky, 0.28),
        band("רווח סמך", g.x, g.ciL, g.ciU, PAL.primary, 0.38),
        {
          name: "מדגם", type: "scatter", symbolSize: 5, z: 2,
          data: res.xs.map((x, i) => [x, res.ys[i]]),
          itemStyle: { color: PAL.grey, opacity: 0.7 },
        },
        line("הקשר האמיתי", g.truth, th.truth, 2, { lineStyle: { color: th.truth, width: 2, type: "dashed" } }),
        line("קו הרגרסיה", g.fit, PAL.accent, 2.5, p.extrapolate ? {
          markArea: {
            silent: true, itemStyle: { color: th.grid, opacity: 0.35 },
            label: { color: th.muted, position: "insideTop" },
            data: [[{ xAxis: p.xmin, name: "טווח הנתונים" }, { xAxis: p.xmax }]],
          },
        } : {}),
      ];

      const prev = chart.getOption();
      const selected = prev && prev.legend && prev.legend[0] ? prev.legend[0].selected : undefined;

      chart.setOption({
        animation: false,
        textStyle: { fontFamily: "Heebo, system-ui, sans-serif", color: th.text },
        grid: { left: 60, right: 20, top: 50, bottom: 50 },
        legend: {
          top: 0, textStyle: { color: th.text, fontSize: 13 }, selected,
          data: series.map((sr) => ({ name: sr.name, icon: sr.type === "line" ? "path://M0 0H24V3H0Z" : undefined })),
        },
        tooltip: {
          trigger: "axis", axisPointer: { type: "line" },
          formatter(items) {
            const it = items.find((q) => q.seriesName === "קו הרגרסיה");
            if (!it) return "";
            const i = it.dataIndex;
            return `<div dir="rtl" style="text-align:right">
              <b>x = ${fmt(g.x[i], 2)}</b><br>
              הקשר האמיתי: ${fmt(g.truth[i])}<br>
              קו הרגרסיה: ${fmt(g.fit[i])}<br>
              רווח סמך: [${fmt(g.ciL[i])}, ${fmt(g.ciU[i])}]<br>
              רווח חיזוי: [${fmt(g.piL[i])}, ${fmt(g.piU[i])}]</div>`;
          },
        },
        xAxis: {
          type: "value", min: +res.lo.toFixed(3), max: +res.hi.toFixed(3), name: "x",
          nameLocation: "middle", nameGap: 28,
          axisLabel: { color: th.muted }, axisLine: { lineStyle: { color: th.muted } },
          splitLine: { lineStyle: { color: th.grid } },
        },
        yAxis: {
          type: "value", scale: true, name: "y", nameLocation: "middle", nameGap: 42,
          axisLabel: { color: th.muted }, splitLine: { lineStyle: { color: th.grid } },
        },
        series,
      }, { replaceMerge: ["series"] });
    }

    el.querySelectorAll("input, select").forEach((inp) => inp.addEventListener("input", render));
    $("resample").addEventListener("click", () => {
      seed = (Math.random() * 2 ** 31) >>> 0;
      d = draws(seed);
      render();
    });
    $("copy").addEventListener("click", () => {
      navigator.clipboard && navigator.clipboard.writeText($("rcode").textContent);
      $("copy").textContent = "הועתק";
      setTimeout(() => ($("copy").textContent = "העתקה"), 1500);
    });
    window.addEventListener("resize", () => chart.resize());
    // Re-colour when the reader toggles light / dark mode.
    new MutationObserver(render).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(typeof self !== "undefined" ? self : this);

// Numbers copied from the paper (Overleaf 6d436eb). Source noted per block. Edit here, not in main.js.
window.GA_DATA = {
  // groups: ours | none (no reasoning) | explicit | latent
  groups: {
    ours: { label: "GistAct (ours)", color: "#6aaa00" },
    none: { label: "No reasoning", color: "#9085e9" },
    explicit: { label: "Explicit reasoning", color: "#d95926" },
    latent: { label: "Latent reasoning", color: "#3987e5" }
  },
  // Table 1 (sec/3_method.tex, tab:main). RoboSPA spatial-24: Geo, Dist, Pos, Ref, View, Avg. VLABench: In-dist, Cross-cat, Common, Sem, Texture, Avg.
  table1: {
    robospa_cols: ["Geometric attribute", "Spatial distance", "Position index", "Referential relation", "Viewpoint", "Average"],
    vlabench_cols: ["In-distribution", "Cross-category", "Common sense", "Semantic instruction", "Unseen texture", "Average"],
    rows: [
      { m: "MolmoAct2", g: "none", r: [36.2, 33.8, 36.3, 22.8, 30.8, 32.0], v: [58.2, 35.6, 30.4, 38.2, 54.4, 43.4] },
      { m: "π0.5", g: "none", r: [50.6, 42.3, 28.5, 31.5, 48.9, 40.4], v: [43.6, 29.4, 26.0, 28.0, 37.2, 32.8] },
      { m: "X-VLA", g: "none", r: [36.8, 37.2, 18.9, 22.6, 45.6, 32.2], v: [53.6, 20.9, 29.0, 44.2, 44.2, 38.4] },
      { m: "Pointing-VLA", g: "none", r: [52.2, 44.8, 29.2, 31.1, 56.7, 42.8], v: [47.8, 35.9, 29.0, 34.8, 40.0, 37.5] },
      { m: "ECoT-Lite", g: "explicit", r: [22.6, 36.7, 34.9, 14.4, 31.5, 28.0], v: [47.2, 28.8, 28.1, 35.7, 46.9, 37.3] },
      { m: "ECoT-Lite (CoT on)", g: "explicit", r: [20.0, 38.1, 37.9, 15.2, 32.6, 28.8], v: [51.2, 31.0, 31.1, 31.7, 49.5, 38.9] },
      { m: "ERVLA", g: "explicit", r: [22.7, 46.2, 34.5, 24.1, 41.8, 33.9], v: [63.0, 50.2, 34.0, 47.4, 57.6, 50.4] },
      { m: "ERVLA (CoT on)", g: "explicit", r: [20.5, 34.6, 29.8, 16.8, 31.5, 26.6], v: [62.6, 51.3, 36.4, 52.8, 60.4, 52.7] },
      { m: "MolmoAct2-Think", g: "explicit", r: [30.1, 33.8, 34.3, 22.2, 20.0, 28.1], v: [63.4, 27.6, 39.6, 43.8, 58.8, 46.6] },
      { m: "Fast-ThinkAct", g: "latent", r: [7.1, 15.9, 10.2, 4.5, 4.4, 8.4], v: [19.6, 8.0, 11.8, 15.2, 13.0, 13.5] },
      { m: "LaRA-VLA", g: "latent", r: [31.0, 44.7, 36.3, 18.2, 32.1, 32.4], v: [43.8, 21.3, 16.8, 15.2, 20.2, 23.5] },
      { m: "LaST0", g: "latent", r: [13.1, 16.6, 12.0, 2.8, 8.3, 10.6], v: [21.2, 11.7, 9.2, 3.0, 8.2, 10.7] },
      { m: "GistAct", g: "ours", r: [68.6, 60.6, 90.2, 49.3, 70.4, 67.8], v: [70.8, 39.0, 53.6, 68.0, 65.6, 59.4] }
    ]
  },
  // figs/fig4_results_mechanism/data/levels.json (RoboSPA SR by difficulty level L1..L5)
  levels: {
    x: ["L1", "L2", "L3", "L4", "L5"],
    rows: [
      { m: "GistAct", g: "ours", y: [76.3, 71.1, 68.0, 65.6, 58.0] },
      { m: "π0.5", g: "none", y: [51.3, 43.5, 39.9, 36.6, 30.4] },
      { m: "X-VLA", g: "none", y: [43.2, 35.3, 29.8, 28.3, 24.5] },
      { m: "MolmoAct2", g: "none", y: [36.0, 33.3, 32.7, 30.3, 27.6] },
      { m: "ERVLA", g: "explicit", y: [37.7, 36.8, 35.3, 32.8, 26.7] },
      { m: "ECoT-Lite", g: "explicit", y: [42.1, 29.6, 26.0, 21.7, 20.7] },
      { m: "LaRA-VLA", g: "latent", y: [41.9, 34.4, 30.7, 28.5, 26.7] }
    ]
  },
  // figs/fig3_real_robot/data/data.json (Franka FR3, 20 trials per track and policy)
  real: {
    tracks: ["Semantic reference", "Position index", "Size rank", "Category sort", "Average"],
    rows: [
      { m: "π0.5", g: "none", y: [45, 55, 50, 40, 47.5] },
      { m: "ERVLA", g: "explicit", y: [40, 40, 30, 20, 32.5] },
      { m: "LaRA-VLA", g: "latent", y: [50, 20, 20, 5, 23.8] },
      { m: "GistAct", g: "ours", y: [70, 75, 70, 50, 66.3] }
    ]
  },
  // figs/fig4_results_mechanism/data/latency_sr.json (ms per decision, RoboSPA SR)
  latency: [
    { m: "GistAct", g: "ours", ms: 149.5, sr: 67.8 },
    { m: "LaRA-VLA", g: "latent", ms: 129.7, sr: 32.4 },
    { m: "LaST0", g: "latent", ms: 352.2, sr: 10.6 },
    { m: "Fast-ThinkAct", g: "latent", ms: 413.0, sr: 8.4 },
    { m: "ERVLA", g: "explicit", ms: 155.5, sr: 33.9 },
    { m: "ERVLA (CoT on)", g: "explicit", ms: 15677.6, sr: 26.6 },
    { m: "ECoT-Lite", g: "explicit", ms: 115.9, sr: 28.0 },
    { m: "ECoT-Lite (CoT on)", g: "explicit", ms: 5530.5, sr: 28.8 },
    { m: "MolmoAct2-Think", g: "explicit", ms: 1426.8, sr: 28.1 },
    { m: "π0.5", g: "none", ms: 62.0, sr: 40.4 },
    { m: "X-VLA", g: "none", ms: 118.5, sr: 32.2 },
    { m: "MolmoAct2", g: "none", ms: 380.5, sr: 32.0 }
  ],
  // figs/fig4_results_mechanism/make.py BARS (component ablation on RoboSPA; steer = share of episodes that follow a swapped Think)
  ladder: [
    { step: "Act only", sr: 40.2, steer: null, note: "No Think. The action expert reads the instruction." },
    { step: "+ Think, no supervision", sr: 34.1, steer: 21.6, note: "Latent states are added but nothing shapes them." },
    { step: "+ Think supervision", sr: 55.0, steer: 73.6, note: "Each state is matched to a sentence or a region." },
    { step: "+ Answer supervision", sr: 58.0, steer: 79.0, note: "The final state is trained to mark the goal in the image." },
    { step: "+ Attention bias", sr: 61.0, steer: 82.6, note: "The answer biases the action expert's attention." },
    { step: "GistAct: no direct read", sr: 67.8, steer: 87.0, note: "The action expert stops reading the instruction." }
  ],
  headline: { robospa: 67.8, robospa_base: 42.8, vlabench: 59.4, vlabench_base: 52.7, real: 66.3, real_base: 47.5, latency_s: 0.15 }
};

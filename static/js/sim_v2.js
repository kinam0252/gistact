window.GA_SIM2 = [
 {
  "id": "vlabench_v13", "bench": "VLABench", "label": "Cider fruit",
  "instruction": "Put the fruit for homemade cider on the plate.",
  "clips": {
   "ours": {"src": "static/media/vlabench_v2/v13/ours.mp4", "poster": "static/media/vlabench_v2/v13/ours.jpg", "w": 1280, "h": 960, "dur": 4.55},
   "base": {"src": "static/media/vlabench_v2/v13/base.mp4", "poster": "static/media/vlabench_v2/v13/base.jpg", "w": 1280, "h": 960, "dur": 6.2}
  },
  "base_name": "ERVLA", "base_outcome": "Puts the banana on the plate.",
  "steps": [
   {"kind": "L", "text": "Cider is pressed from apples."},
   {"kind": "V", "cx": 0.39, "cy": 0.385, "rx": 0.03, "ry": 0.04, "text": "This red one is the apple."}
  ],
  "goal": [
   {"until": 2.3, "cx": 0.39, "cy": 0.385, "rx": 0.03, "ry": 0.04},
   {"t": 2.45, "until": 4.5, "cx": 0.65, "cy": 0.73, "rx": 0.14, "ry": 0.13}
  ]
 },
 {
  "id": "vlabench_v05", "bench": "VLABench", "label": "Marvel hero",
  "instruction": "Put the Marvel hero who swings between buildings into the box.",
  "clips": {
   "ours": {"src": "static/media/vlabench_v2/v05/ours.mp4", "poster": "static/media/vlabench_v2/v05/ours.jpg", "w": 1280, "h": 960, "dur": 6.35},
   "base": {"src": "static/media/vlabench_v2/v05/base.mp4", "poster": "static/media/vlabench_v2/v05/base.jpg", "w": 1280, "h": 960, "dur": 4.8}
  },
  "base_name": "ERVLA", "base_outcome": "Lifts the green alien.",
  "steps": [
   {"kind": "L", "text": "The hero who swings between buildings is Spider-Man."},
   {"kind": "V", "cx": 0.665, "cy": 0.57, "rx": 0.05, "ry": 0.09, "text": "This red and blue figure is Spider-Man."}
  ],
  "goal": [
   {"until": 2.35, "cx": 0.665, "cy": 0.57, "rx": 0.05, "ry": 0.09},
   {"t": 2.5, "until": 6.3, "cx": 0.57, "cy": 0.4, "rx": 0.11, "ry": 0.13}
  ]
 },
 {
  "id": "vlabench_v00", "bench": "VLABench", "label": "Expressionism",
  "instruction": "Press the button of the expressionist painting.",
  "clips": {
   "ours": {"src": "static/media/vlabench_v2/v00/ours.mp4", "poster": "static/media/vlabench_v2/v00/ours.jpg", "w": 1280, "h": 960, "dur": 4.85},
   "base": {"src": "static/media/vlabench_v2/v00/base.mp4", "poster": "static/media/vlabench_v2/v00/base.jpg", "w": 1280, "h": 960, "dur": 4.5}
  },
  "base_name": "ERVLA", "base_outcome": "Presses the button of the blossom painting.",
  "steps": [
   {"kind": "L", "text": "Expressionism paints distorted figures in bold colour."},
   {"kind": "V", "cx": 0.38, "cy": 0.78, "rx": 0.05, "ry": 0.07, "text": "This portrait is the expressionist one."},
   {"kind": "V", "cx": 0.48, "cy": 0.565, "rx": 0.035, "ry": 0.035, "text": "Its button is just above it."}
  ],
  "goal": [
   {"until": 2.05, "cx": 0.48, "cy": 0.565, "rx": 0.035, "ry": 0.035}
  ]
 },
 {
  "id": "robospa_r08", "bench": "RoboSPA", "label": "Farthest from bowl",
  "instruction": "Pick up the object farthest from the bowl.",
  "clips": {
   "ours": {"src": "static/media/robospa_v2/r08/ours.mp4", "poster": "static/media/robospa_v2/r08/ours.jpg", "w": 960, "h": 720, "dur": 5.85},
   "base": {"src": "static/media/robospa_v2/r08/base.mp4", "poster": "static/media/robospa_v2/r08/base.jpg", "w": 960, "h": 720, "dur": 5.5}
  },
  "base_name": "Pointing-VLA", "base_outcome": "Lifts the yellow tea box.",
  "steps": [
   {"kind": "V", "cx": 0.535, "cy": 0.49, "rx": 0.08, "ry": 0.08, "text": "This is the bowl."},
   {"kind": "V", "cx": 0.79, "cy": 0.775, "rx": 0.07, "ry": 0.07, "text": "The pink car is the farthest from it."}
  ],
  "goal": [
   {"until": 4.2, "cx": 0.79, "cy": 0.775, "rx": 0.05, "ry": 0.05}
  ]
 },
 {
  "id": "robospa_r15", "bench": "RoboSPA", "label": "Front from the left",
  "instruction": "Seen from the left side of the table, pick up the frontmost object.",
  "clips": {
   "ours": {"src": "static/media/robospa_v2/r15/ours.mp4", "poster": "static/media/robospa_v2/r15/ours.jpg", "w": 960, "h": 720, "dur": 3.9},
   "base": {"src": "static/media/robospa_v2/r15/base.mp4", "poster": "static/media/robospa_v2/r15/base.jpg", "w": 960, "h": 720, "dur": 5.2}
  },
  "base_name": "Pointing-VLA", "base_outcome": "Lifts the playing cards.",
  "steps": [
   {"kind": "L", "text": "From the left side, the front is the left edge."},
   {"kind": "V", "cx": 0.3, "cy": 0.52, "rx": 0.06, "ry": 0.05, "text": "The blue soap is closest to that edge."}
  ],
  "goal": [
   {"until": 2.3, "cx": 0.3, "cy": 0.52, "rx": 0.05, "ry": 0.045}
  ]
 },
 {
  "id": "robospa_r06", "bench": "RoboSPA", "label": "Farthest from bell",
  "instruction": "Pick up the object farthest from the bell.",
  "clips": {
   "ours": {"src": "static/media/robospa_v2/r06/ours.mp4", "poster": "static/media/robospa_v2/r06/ours.jpg", "w": 960, "h": 720, "dur": 4.8},
   "base": {"src": "static/media/robospa_v2/r06/base.mp4", "poster": "static/media/robospa_v2/r06/base.jpg", "w": 960, "h": 720, "dur": 5.3}
  },
  "base_name": "Pointing-VLA", "base_outcome": "Lifts the red can.",
  "steps": [
   {"kind": "V", "cx": 0.51, "cy": 0.35, "rx": 0.06, "ry": 0.05, "text": "This is the bell."},
   {"kind": "V", "cx": 0.57, "cy": 0.83, "rx": 0.06, "ry": 0.075, "text": "The red apple is the farthest from it."}
  ],
  "goal": [
   {"until": 2.6, "cx": 0.57, "cy": 0.83, "rx": 0.055, "ry": 0.07}
  ]
 }
];

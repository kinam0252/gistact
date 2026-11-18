window.GA_RLB = [
 {
  "id": "robolab_lb_XrSmallestItemTask_ep1001",
  "instruction": "Put the smallest item on the table into the bowl.",
  "short": "the smallest item",
  "clips": {
   "gistact": {
    "src": "static/media/robolab_lb/XrSmallestItemTask_ep1001/gistact.mp4",
    "poster": "static/media/robolab_lb/XrSmallestItemTask_ep1001/gistact.jpg",
    "w": 1280,
    "h": 720,
    "dur": 21.0
   },
   "pi05": {
    "src": "static/media/robolab_lb/XrSmallestItemTask_ep1001/pi05.mp4",
    "poster": "static/media/robolab_lb/XrSmallestItemTask_ep1001/pi05.jpg",
    "w": 1280,
    "h": 720,
    "dur": 15.0
   }
  },
  "pi05_outcome": "Puts the Rubik’s cube in the bowl.",
  "goal": [
   {
    "until": 17.1,
    "cx": 0.623,
    "cy": 0.489,
    "rx": 0.022,
    "ry": 0.035
   },
   {
    "t": 17.5,
    "until": 21.0,
    "cx": 0.48,
    "cy": 0.615,
    "rx": 0.05,
    "ry": 0.05
   }
  ],
  "steps": [
   {
    "kind": "V",
    "cx": 0.575,
    "cy": 0.505,
    "rx": 0.028,
    "ry": 0.042,
    "text": "The Rubik’s cube is bigger than the lychee."
   },
   {
    "kind": "V",
    "cx": 0.623,
    "cy": 0.489,
    "rx": 0.022,
    "ry": 0.035,
    "text": "This lychee is the smallest item."
   },
   {
    "kind": "L",
    "text": "I’ll put the lychee into the bowl."
   }
  ]
 },
 {
  "id": "robolab_lb_XrBetweenBinsTask_ep1002",
  "instruction": "Put the item between the two bins into the bowl.",
  "short": "between the two bins",
  "clips": {
   "gistact": {
    "src": "static/media/robolab_lb/XrBetweenBinsTask_ep1002/gistact.mp4",
    "poster": "static/media/robolab_lb/XrBetweenBinsTask_ep1002/gistact.jpg",
    "w": 1280,
    "h": 720,
    "dur": 15.13
   },
   "pi05": {
    "src": "static/media/robolab_lb/XrBetweenBinsTask_ep1002/pi05.mp4",
    "poster": "static/media/robolab_lb/XrBetweenBinsTask_ep1002/pi05.jpg",
    "w": 1280,
    "h": 720,
    "dur": 18.0
   }
  },
  "pi05_outcome": "Drops the can beside the bowl.",
  "goal": [
   {
    "until": 11.1,
    "cx": 0.5625,
    "cy": 0.528,
    "rx": 0.025,
    "ry": 0.045
   },
   {
    "t": 11.5,
    "until": 15.1,
    "cx": 0.498,
    "cy": 0.49,
    "rx": 0.04,
    "ry": 0.04
   }
  ],
  "steps": [
   {
    "kind": "V",
    "cx": 0.713,
    "cy": 0.519,
    "rx": 0.022,
    "ry": 0.035,
    "text": "This can is outside the bins."
   },
   {
    "kind": "V",
    "cx": 0.5625,
    "cy": 0.528,
    "rx": 0.025,
    "ry": 0.045,
    "text": "This can sits between the two bins."
   },
   {
    "kind": "V",
    "cx": 0.498,
    "cy": 0.49,
    "rx": 0.04,
    "ry": 0.04,
    "text": "It goes into the bowl."
   }
  ]
 },
 {
  "id": "robolab_lb_XrSmallerThanTask_ep0",
  "instruction": "Put the fruits that are smaller than the orange into the bowl.",
  "short": "smaller than the orange",
  "clips": {
   "gistact": {
    "src": "static/media/robolab_lb/XrSmallerThanTask_ep0/gistact.mp4",
    "poster": "static/media/robolab_lb/XrSmallerThanTask_ep0/gistact.jpg",
    "w": 1280,
    "h": 720,
    "dur": 39.67
   },
   "pi05": {
    "src": "static/media/robolab_lb/XrSmallerThanTask_ep0/pi05.mp4",
    "poster": "static/media/robolab_lb/XrSmallerThanTask_ep0/pi05.jpg",
    "w": 1280,
    "h": 720,
    "dur": 47.0
   }
  },
  "pi05_outcome": "Puts the orange in too.",
  "goal": [
   {
    "until": 8.5,
    "cx": 0.5625,
    "cy": 0.65,
    "rx": 0.022,
    "ry": 0.035
   },
   {
    "t": 11.0,
    "until": 20.0,
    "cx": 0.65,
    "cy": 0.584,
    "rx": 0.022,
    "ry": 0.035
   },
   {
    "t": 27.0,
    "until": 35.0,
    "cx": 0.63,
    "cy": 0.47,
    "rx": 0.018,
    "ry": 0.03
   }
  ],
  "steps": [
   {
    "kind": "V",
    "cx": 0.49,
    "cy": 0.6,
    "rx": 0.025,
    "ry": 0.04,
    "text": "The orange stays out."
   },
   {
    "kind": "V",
    "cx": 0.5625,
    "cy": 0.65,
    "rx": 0.022,
    "ry": 0.035,
    "text": "Lemon: smaller, into the bowl."
   },
   {
    "kind": "L",
    "text": "The lime and the lychee are smaller too."
   }
  ]
 }
];

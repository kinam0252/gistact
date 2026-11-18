// Think states and goal regions per episode, in generation order.
// goal: the region the answer highlights (one region, or a list of { t, until } regions in clip seconds for multi-step tasks).
// A step with `was` is an edited state: the page strikes `was` through and shows `text` in the accent colour.
// Keys are episode ids; "<id>/edit" is the edited clip of an edit pair; "fr3:<id>" is used with the clips in real_fr3.js.
// Coordinates (cx, cy, rx, ry) are normalised to the video frame.
window.GA_THINK = {
  /* ------------------------------------------------------------ VLABench */
  vlabench_t3_insert_flower_ep0001: { goal: { cx: .245, cy: .50, rx: .045, ry: .05 }, steps: [
    { kind: 'L', text: 'One flower stands for Valentine’s Day.' },
    { kind: 'V', cx: .73, cy: .545, rx: .05, ry: .05, text: 'This big yellow one is a sunflower.' },
    { kind: 'V', cx: .52, cy: .52, rx: .035, ry: .04, text: 'This small white one is a daisy.' },
    { kind: 'V', cx: .245, cy: .50, rx: .045, ry: .045, text: 'This red one is a rose.' },
    { kind: 'L', text: 'The rose is the Valentine’s flower.' },
    { kind: 'V', cx: .37, cy: .53, rx: .05, ry: .06, text: 'The vase is right next to it.' },
    { kind: 'L', text: 'I’ll put the rose into the vase.' }
  ] },

  /* ------------------------------------------------------------ RoboSPA */
  robospa_seals_mv_s100027: { goal: { cx: .37, cy: .87, rx: .05, ry: .085 }, steps: [
    { kind: 'L', text: 'Front is the side farther from the viewer.' },
    { kind: 'L', text: 'Seen from the opposite side, that is the side near me.' },
    { kind: 'V', cx: .32, cy: .485, rx: .05, ry: .08, text: 'This seal is far from me, so it is at the back.' },
    { kind: 'V', cx: .37, cy: .87, rx: .05, ry: .085, text: 'This seal is the nearest to me.' },
    { kind: 'L', text: 'So it is the frontmost one.' },
    { kind: 'L', text: 'I’ll pick it up from above.' }
  ] },

  /* ------------------------------------------------------------ real robot */
  real_sem26_r0: { goal: { cx: .565, cy: .645, rx: .035, ry: .04 }, steps: [
    { kind: 'L', text: 'You dip strawberries in chocolate.' },
    { kind: 'V', cx: .565, cy: .645, rx: .04, ry: .045, text: 'This is the strawberry.' }
  ] },
  'fr3:real_sem26_r0': { goal: { cx: .513, cy: .627, rx: .035, ry: .04 }, steps: [
    { kind: 'L', text: 'You dip strawberries in chocolate.' },
    { kind: 'V', cx: .513, cy: .627, rx: .04, ry: .045, text: 'This is the strawberry.' }
  ] },
  real_pos06_r0: { goal: { cx: .51, cy: .765, rx: .04, ry: .055 }, steps: [
    { kind: 'V', cx: .395, cy: .845, rx: .05, ry: .065, text: 'First from the left: the lemon.' },
    { kind: 'V', cx: .51, cy: .765, rx: .045, ry: .06, text: 'Second: the corn.' }
  ] },
  'fr3:real_pos06_r0': { goal: { cx: .496, cy: .729, rx: .035, ry: .05 }, steps: [
    { kind: 'V', cx: .383, cy: .776, rx: .045, ry: .06, text: 'First from the left: the lemon.' },
    { kind: 'V', cx: .496, cy: .729, rx: .04, ry: .06, text: 'Second: the corn.' }
  ] },
  real_rank_indist_7390047_r0: { goal: [
    { until: 3.53, cx: .61, cy: .685, rx: .035, ry: .05 },
    { t: 4.0, until: 10.0, cx: .775, cy: .655, rx: .07, ry: .05 }
  ], steps: [
    { kind: 'V', cx: .51, cy: .59, rx: .045, ry: .055, text: 'The apple is the biggest fruit.' },
    { kind: 'V', cx: .61, cy: .685, rx: .04, ry: .055, text: 'The watermelon slice is second.' },
    { kind: 'V', cx: .775, cy: .655, rx: .075, ry: .055, text: 'It goes on the tray.' }
  ] },
  // tangerine grasped at 3.7 s, set on the tray at 9.7 s
  'fr3:real_rank_indist_7390047_r0': { goal: [
    { until: 3.68, cx: .573, cy: .646, rx: .03, ry: .04 },
    { t: 4.2, until: 9.68, cx: .75, cy: .655, rx: .075, ry: .05 }
  ], steps: [
    { kind: 'V', cx: .479, cy: .568, rx: .04, ry: .05, text: 'The apple is the biggest fruit.' },
    { kind: 'V', cx: .573, cy: .646, rx: .035, ry: .045, text: 'The tangerine is second.' },
    { kind: 'V', cx: .756, cy: .659, rx: .08, ry: .055, text: 'It goes on the tray.' }
  ] },
  // Sort picks objects in turn: each region is drawn from `t` (the previous release) until `until` (its grasp)
  real_sort_indist_7090001_r0: { goal: [
    { until: 6.5, cx: .33, cy: .81, rx: .035, ry: .045 },
    { t: 12.5, until: 18.3, cx: .395, cy: .66, rx: .04, ry: .05 },
    { t: 23.3, until: 28.9, cx: .62, cy: .79, rx: .06, ry: .045 },
    { t: 34.5, until: 38.8, cx: .505, cy: .60, rx: .045, ry: .035 }
  ], steps: [
    { kind: 'V', cx: .33, cy: .81, rx: .04, ry: .05, text: 'Grapes: a fruit, to the bowl.' },
    { kind: 'V', cx: .395, cy: .66, rx: .045, ry: .055, text: 'Lemon: a fruit, to the bowl.' },
    { kind: 'V', cx: .62, cy: .79, rx: .065, ry: .05, text: 'Eggplant: a vegetable, to the tray.' },
    { kind: 'V', cx: .505, cy: .60, rx: .05, ry: .04, text: 'Watermelon: a fruit, to the bowl.' }
  ] },
  // grasps 6.6 / 18.5 / 29.1 / 39.0 s, releases 12.7 / 23.5 / 34.7 / 42.8 s
  'fr3:real_sort_indist_7090001_r0': { goal: [
    { until: 6.62, cx: .293, cy: .792, rx: .035, ry: .05 },
    { t: 12.68, until: 18.48, cx: .362, cy: .654, rx: .03, ry: .04 },
    { t: 23.48, until: 29.08, cx: .57, cy: .76, rx: .05, ry: .04 },
    { t: 34.68, until: 38.95, cx: .484, cy: .585, rx: .028, ry: .038 }
  ], steps: [
    { kind: 'V', cx: .293, cy: .792, rx: .04, ry: .06, text: 'Grapes: a fruit, to the bowl.' },
    { kind: 'V', cx: .362, cy: .654, rx: .035, ry: .045, text: 'Lemon: a fruit, to the bowl.' },
    { kind: 'V', cx: .57, cy: .76, rx: .055, ry: .045, text: 'Eggplant: a vegetable, to the tray.' },
    { kind: 'V', cx: .484, cy: .585, rx: .032, ry: .042, text: 'Tangerine: a fruit, to the bowl.' }
  ] },

  /* ------------------------------------------------------------ Think edit pairs */
  edit2_pos02_r0_lemon: { goal: { cx: .71, cy: .65, rx: .04, ry: .05 }, steps: [
    { kind: 'L', text: 'I need the second object from the right.' },
    { kind: 'V', cx: .795, cy: .615, rx: .045, ry: .06, text: 'First from the right: the lemon.' },
    { kind: 'V', cx: .71, cy: .65, rx: .045, ry: .06, text: 'Second: the strawberry. This is the one.' },
    { kind: 'L', text: 'I’ll pick up the strawberry.' }
  ] },
  'edit2_pos02_r0_lemon/edit': { goal: { cx: .795, cy: .615, rx: .04, ry: .05 }, steps: [
    { kind: 'L', was: 'I need the second object from the right.', text: 'I need the first object from the right.' },
    { kind: 'V', cx: .795, cy: .615, rx: .045, ry: .06, text: 'First from the right: the lemon. This is the one.' },
    { kind: 'L', text: 'I’ll pick up the lemon.' }
  ] },
  'fr3:edit2_pos02_r0_lemon': { goal: { cx: .666, cy: .622, rx: .035, ry: .045 }, steps: [
    { kind: 'L', text: 'I need the second object from the right.' },
    { kind: 'V', cx: .74, cy: .602, rx: .04, ry: .05, text: 'First from the right: the lemon.' },
    { kind: 'V', cx: .666, cy: .622, rx: .04, ry: .05, text: 'Second: the strawberry. This is the one.' },
    { kind: 'L', text: 'I’ll pick up the strawberry.' }
  ] },
  'fr3:edit2_pos02_r0_lemon/edit': { goal: { cx: .74, cy: .602, rx: .035, ry: .045 }, steps: [
    { kind: 'L', was: 'I need the second object from the right.', text: 'I need the first object from the right.' },
    { kind: 'V', cx: .74, cy: .602, rx: .04, ry: .05, text: 'First from the right: the lemon. This is the one.' },
    { kind: 'L', text: 'I’ll pick up the lemon.' }
  ] },
  edit2_pos06_r0_grapes: { goal: { cx: .51, cy: .765, rx: .04, ry: .055 }, steps: [
    { kind: 'L', text: 'I need the second object from the left.' },
    { kind: 'V', cx: .40, cy: .84, rx: .05, ry: .065, text: 'First from the left: the lemon.' },
    { kind: 'V', cx: .51, cy: .765, rx: .045, ry: .065, text: 'Second: the corn. This is the one.' },
    { kind: 'L', text: 'I’ll pick up the corn.' }
  ] },
  'edit2_pos06_r0_grapes/edit': { goal: { cx: .715, cy: .635, rx: .04, ry: .05 }, steps: [
    { kind: 'L', was: 'I need the second object from the left.', text: 'I need the second object from the right.' },
    { kind: 'V', cx: .80, cy: .60, rx: .045, ry: .055, text: 'First from the right: the orange.' },
    { kind: 'V', cx: .715, cy: .635, rx: .045, ry: .055, text: 'Second: the grapes. This is the one.' },
    { kind: 'L', text: 'I’ll pick up the grapes.' }
  ] },
  'fr3:edit2_pos06_r0_grapes': { goal: { cx: .467, cy: .745, rx: .035, ry: .05 }, steps: [
    { kind: 'L', text: 'I need the second object from the left.' },
    { kind: 'V', cx: .344, cy: .82, rx: .045, ry: .06, text: 'First from the left: the lemon.' },
    { kind: 'V', cx: .467, cy: .745, rx: .04, ry: .06, text: 'Second: the corn. This is the one.' },
    { kind: 'L', text: 'I’ll pick up the corn.' }
  ] },
  'fr3:edit2_pos06_r0_grapes/edit': { goal: { cx: .688, cy: .607, rx: .04, ry: .05 }, steps: [
    { kind: 'L', was: 'I need the second object from the left.', text: 'I need the second object from the right.' },
    { kind: 'V', cx: .77, cy: .565, rx: .04, ry: .05, text: 'First from the right: the orange.' },
    { kind: 'V', cx: .688, cy: .607, rx: .045, ry: .055, text: 'Second: the grapes. This is the one.' },
    { kind: 'L', text: 'I’ll pick up the grapes.' }
  ] },
  edit2_sem21_r0_red_apple: { goal: { cx: .535, cy: .865, rx: .04, ry: .055 }, steps: [
    { kind: 'L', text: 'A berry is small and red, with seeds on the outside.' },
    { kind: 'V', cx: .69, cy: .645, rx: .045, ry: .06, text: 'This red one is an apple, not a berry.' },
    { kind: 'V', cx: .535, cy: .865, rx: .045, ry: .06, text: 'Seeds and green leaves. A strawberry.' },
    { kind: 'L', text: 'I’ll pick up the strawberry.' }
  ] },
  'edit2_sem21_r0_red_apple/edit': { goal: { cx: .69, cy: .645, rx: .04, ry: .055 }, steps: [
    { kind: 'L', was: 'A berry is small and red, with seeds on the outside.', text: 'I need the fruit that goes into apple pie.' },
    { kind: 'V', cx: .88, cy: .71, rx: .045, ry: .06, text: 'This red one is a tomato.' },
    { kind: 'V', cx: .69, cy: .645, rx: .045, ry: .06, text: 'This one is an apple. This is the one.' },
    { kind: 'L', text: 'I’ll pick up the apple.' }
  ] },
  'fr3:edit2_sem21_r0_red_apple': { goal: { cx: .49, cy: .83, rx: .035, ry: .05 }, steps: [
    { kind: 'L', text: 'A berry is small and red, with seeds on the outside.' },
    { kind: 'V', cx: .645, cy: .654, rx: .04, ry: .05, text: 'This red one is an apple, not a berry.' },
    { kind: 'V', cx: .49, cy: .83, rx: .04, ry: .055, text: 'Seeds and green leaves. A strawberry.' },
    { kind: 'L', text: 'I’ll pick up the strawberry.' }
  ] },
  'fr3:edit2_sem21_r0_red_apple/edit': { goal: { cx: .645, cy: .654, rx: .04, ry: .05 }, steps: [
    { kind: 'L', was: 'A berry is small and red, with seeds on the outside.', text: 'I need the fruit that goes into apple pie.' },
    { kind: 'V', cx: .838, cy: .696, rx: .045, ry: .055, text: 'This red one is a tomato.' },
    { kind: 'V', cx: .645, cy: .654, rx: .045, ry: .055, text: 'This one is an apple. This is the one.' },
    { kind: 'L', text: 'I’ll pick up the apple.' }
  ] },

  /* ------------------------------------------------------------ RoboLab, ext1 camera */
  // orange grasped ~6.2 s, set on the plate ~8.6 s
  robolab_XrBehindBowlTask_ep1: { goal: [
    { until: 6.2, cx: .413, cy: .352, rx: .034, ry: .05 },
    { t: 6.6, until: 8.6, cx: .538, cy: .37, rx: .05, ry: .055 }
  ], steps: [
    { kind: 'V', cx: .554, cy: .548, rx: .022, ry: .035, text: 'The lemon is in front of the bowl.' },
    { kind: 'V', cx: .413, cy: .352, rx: .025, ry: .04, text: 'The orange is behind the bowl.' },
    { kind: 'V', cx: .538, cy: .37, rx: .045, ry: .045, text: 'It goes on the plate.' }
  ] },
  // lime grasped ~6.8 s and dropped in the bowl ~13 s; lemon picked after a few tries, held ~25.5 s
  robolab_XrExceptOrangeTask_ep2: { goal: [
    { until: 6.8, cx: .54, cy: .38, rx: .034, ry: .05 },
    { t: 13.5, until: 25.5, cx: .46, cy: .42, rx: .032, ry: .048 }
  ], steps: [
    { kind: 'V', cx: .396, cy: .50, rx: .025, ry: .04, text: 'The orange stays out.' },
    { kind: 'V', cx: .54, cy: .38, rx: .025, ry: .04, text: 'Lime: into the bowl.' },
    { kind: 'V', cx: .46, cy: .42, rx: .022, ry: .035, text: 'Lemon: into the bowl.' }
  ] }
};

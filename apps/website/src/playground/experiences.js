// The playground's three sample pages. `label` is the tab; `blurb` sits under
// the tabs; `challenge` is read to screen readers with the sample.
export const EXPERIENCES = [
  {
    id: 'feedback',
    label: 'Feedback',
    blurb: 'A product dashboard in review. Flag what needs work.',
    sampleName: 'Northwind Studio',
    challenge: 'Make a point: circle a metric, point to a button, or highlight an area that needs attention.',
  },
  {
    id: 'teach',
    label: 'Teaching',
    blurb: 'A lesson to walk through. Point out the details that matter.',
    sampleName: 'Forma Learning',
    challenge: 'Guide someone’s attention: circle a step, point to an important detail, or record a short walkthrough.',
  },
  {
    id: 'diagnose',
    label: 'Bug report',
    blurb: 'A form that fails. Show exactly where it breaks.',
    sampleName: 'Ledgerly Billing',
    challenge: 'Find the problem: point to the error, circle the affected field, or record the steps that reproduce it.',
  },
]

export const CHALLENGES = [
  ['Make a point', 'Circle something important.'],
  ['Guide attention', 'Draw an arrow or use the laser pointer.'],
  ['Show, don’t tell', 'Capture a screenshot or record a walkthrough.'],
]

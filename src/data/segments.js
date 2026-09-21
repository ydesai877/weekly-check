// The life segments a user rates each week, grouped into three parts.
// Each segment has a stable id (used as a storage key), an emoji, a label,
// a focus description, and the id of the part it belongs to.
export const PARTS = [
  { id: 'internal', title: 'Part 1: Internal Life (The Self)' },
  { id: 'relational', title: 'Part 2: Relational Life (The Interpersonal Interface)' },
  { id: 'external', title: 'Part 3: External & Structural Life (The Material World)' },
]

export const SEGMENTS = [
  {
    id: 'biological-health',
    part: 'internal',
    emoji: '🫀',
    label: 'Biological & Somatosensory Health',
    focus: 'Nutrition, physical strength, sleep hygiene, mobility, vitality, and somatic awareness.',
  },
  {
    id: 'psychological-emotional',
    part: 'internal',
    emoji: '🧘',
    label: 'Psychological & Emotional Regulation',
    focus: 'Stress tolerance, emotional granularity, mental health, cognitive reframing, and self-compassion.',
  },
  {
    id: 'cognitive-intellectual',
    part: 'internal',
    emoji: '📚',
    label: 'Cognitive & Intellectual Development',
    focus: 'Critical thinking, mental models, reading, learning how to learn, and epistemic curiosity.',
  },
  {
    id: 'identity-ethics',
    part: 'internal',
    emoji: '🧭',
    label: 'Identity, Ethics & Self-Concept',
    focus: 'Core values, self-worth, integrity, narrative identity, personal philosophy, and existential grounding.',
  },
  {
    id: 'creative-expression',
    part: 'internal',
    emoji: '🎨',
    label: 'Creative Expression & Flow',
    focus: 'Generating original ideas, artistic outlets, craft, aesthetic sensitivity, and non-utilitarian play.',
  },
  {
    id: 'interpersonal-mastery',
    part: 'relational',
    emoji: '🗣️',
    label: 'Interpersonal Mastery & Social Mechanics',
    focus:
      'Active listening, assertive communication, conflict resolution, charisma, reading non-verbal cues, negotiation, and boundary setting.',
  },
  {
    id: 'intimacy-bonds',
    part: 'relational',
    emoji: '💞',
    label: 'Intimacy & Close Bonds',
    focus: 'Depth of connection in romance/partnership, family systems, and the vulnerable inner circle of friends.',
  },
  {
    id: 'civic-engagement',
    part: 'relational',
    emoji: '🌍',
    label: 'Civic Engagement & Community Contribution',
    focus: 'Mentorship, philanthropy, civic duty, belonging to wider groups, and generational stewardship.',
  },
  {
    id: 'professional-craft',
    part: 'external',
    emoji: '💼',
    label: 'Professional Craft & Career Capital',
    focus: 'Workplace leverage, specialized mastery, executive presence, reputation, and leadership.',
  },
  {
    id: 'wealth-architecture',
    part: 'external',
    emoji: '🏦',
    label: 'Wealth Architecture & Resource Management',
    focus: 'Cash flow, investment literacy, risk management, asset protection, and financial autonomy.',
  },
  {
    id: 'physical-environment',
    part: 'external',
    emoji: '🏡',
    label: 'Physical Environment & Presentation',
    focus: 'Curated living/working spaces, geographic alignment, sartorial style, grooming, and ambient order.',
  },
  {
    id: 'execution-agency',
    part: 'external',
    emoji: '🎯',
    label: 'Execution, Agency & Meta-Systems',
    focus: 'Goal architecture, daily routines, time allocation, habit formation, and decisive follow-through.',
  },
]

export function segmentById(id) {
  return SEGMENTS.find((s) => s.id === id)
}

export function segmentsByPart(partId) {
  return SEGMENTS.filter((s) => s.part === partId)
}

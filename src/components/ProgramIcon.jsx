import { GraduationCap, HeartPulse, PersonStanding, Pill, Smile, Stethoscope } from 'lucide-react';

// Lives here rather than in the program configs so those stay plain data (the API imports them)
const ICONS = {
  dental: Smile,
  medical: Stethoscope,
  'physician-assistant': HeartPulse,
  'physical-therapy': PersonStanding,
  pharmacy: Pill,
};

export default function ProgramIcon({ slug, ...props }) {
  const Icon = ICONS[slug] || GraduationCap;
  return <Icon aria-hidden="true" {...props} />;
}

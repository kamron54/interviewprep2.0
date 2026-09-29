import dental from './dental.js';
import medical from './medical.js';
import { physicianAssistant, physicalTherapy, pharmacy } from './comingSoon.js';

// Order here is the order programs appear in menus and on the homepage
const PROGRAMS = [dental, medical, physicianAssistant, physicalTherapy, pharmacy];

export const DEFAULT_PROGRAM = 'dental';

// Short URLs that redirect to a program's page, e.g. /pt → /physical-therapy
export const PROGRAM_ALIASES = {
  dentistry: 'dental',
  med: 'medical',
  medicine: 'medical',
  pa: 'physician-assistant',
  pt: 'physical-therapy',
  pharm: 'pharmacy',
};

export function getProgram(slug) {
  if (typeof slug !== 'string') return null;
  return PROGRAMS.find((p) => p.slug === slug.toLowerCase()) || null;
}

export function allPrograms() {
  return PROGRAMS;
}

export function livePrograms() {
  return PROGRAMS.filter((p) => p.status === 'live');
}

export function comingSoonPrograms() {
  return PROGRAMS.filter((p) => p.status === 'soon');
}

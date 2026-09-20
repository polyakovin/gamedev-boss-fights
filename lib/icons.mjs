import {
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  Moon,
  Play,
  Plus,
  RotateCcw,
  Search,
  SquarePen,
  Sun,
} from 'lucide';

const icons = {
  'arrow-right': ArrowRight,
  check: Check,
  'chevron-down': ChevronDown,
  download: Download,
  'external-link': ExternalLink,
  moon: Moon,
  play: Play,
  plus: Plus,
  'rotate-ccw': RotateCcw,
  search: Search,
  'square-pen': SquarePen,
  sun: Sun,
};

function escapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function renderAttributes(attributes) {
  return Object.entries(attributes)
    .map(([name, value]) => `${name}="${escapeAttribute(value)}"`)
    .join(' ');
}

function renderNode([tag, attributes, children = []]) {
  const content = children.map(renderNode).join('');
  return `<${tag} ${renderAttributes(attributes)}>${content}</${tag}>`;
}

export function icon(name, { className = '', label = '' } = {}) {
  const nodes = icons[name];
  if (!nodes) throw new Error(`Unknown Lucide icon: ${name}`);
  const accessibility = label
    ? `role="img" aria-label="${escapeAttribute(label)}"`
    : 'aria-hidden="true"';
  const classAttribute = ['icon', className].filter(Boolean).join(' ');
  return `<svg
    class="${escapeAttribute(classAttribute)}"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    ${accessibility}
    focusable="false"
  >${nodes.map(renderNode).join('')}</svg>`;
}

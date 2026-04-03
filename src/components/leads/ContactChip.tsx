import type { Contact, ContactRole } from '../../types';

// ─── Role → colour mapping (Open/Closed — extend without touching chip logic)

const ROLE_COLORS: Partial<Record<ContactRole, string>> = {
  'CEO':                    'bg-orange-50 text-orange-700',
  'Founder':                'bg-orange-50 text-orange-700',
  'Co-Founder':             'bg-orange-50 text-orange-700',
  'CTO':                    'bg-purple-50 text-purple-700',
  'VP of Engineering':      'bg-indigo-50 text-indigo-700',
  'VP Engineering':         'bg-indigo-50 text-indigo-700',
  'VP of Product':          'bg-indigo-50 text-indigo-700',
  'VP of Technology':       'bg-indigo-50 text-indigo-700',
  'Head of Engineering':    'bg-indigo-50 text-indigo-700',
  'Director of Engineering':'bg-indigo-50 text-indigo-700',
  'Head of Product':        'bg-indigo-50 text-indigo-700',
  'Head of Technology':     'bg-indigo-50 text-indigo-700',
  'Engineering Manager':    'bg-indigo-50 text-indigo-700',
  'HR':                     'bg-green-50 text-green-700',
  'Recruiter':              'bg-green-50 text-green-700',
  'Head of Talent':         'bg-green-50 text-green-700',
  'Head of People':         'bg-green-50 text-green-700',
  'Talent Acquisition':     'bg-green-50 text-green-700',
  'Head of HR':             'bg-green-50 text-green-700',
  'VP of HR':               'bg-green-50 text-green-700',
};

interface ContactChipProps { contact: Contact }

export default function ContactChip({ contact }: ContactChipProps) {
  const color = ROLE_COLORS[contact.role] ?? 'bg-gray-100 text-gray-600';
  const firstName = contact.fullName?.split(' ')[0] ?? '?';

  return (
    <div className={`${color} px-1.5 py-0.5 rounded text-[10px] flex items-center gap-0.5 leading-tight`}>
      <span>{firstName} · {contact.role}</span>
      {contact.email && (
        <span className={contact.emailVerified ? 'text-green-500' : 'text-yellow-400'}>●</span>
      )}
    </div>
  );
}

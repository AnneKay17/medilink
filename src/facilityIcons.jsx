import { BriefcaseMedical, Clock3, Cross, Hospital, HousePlus, Stethoscope } from 'lucide-react'

const ICONS_BY_TYPE = {
  Clinic: { Icon: Cross },
  'Satellite Clinic': { Icon: Cross, badge: 'S' },
  'Health Post': { Icon: BriefcaseMedical },
  'Community Health Centre': { Icon: HousePlus },
  'Community Health Centre (After hours)': { Icon: HousePlus, badge: 'clock' },
  'Community Health Centre/Clinic': { Icon: HousePlus },
  'District Hospital': { Icon: Hospital, badge: 'D' },
  'Regional Hospital': { Icon: Hospital, badge: 'R' },
  'Provincial Tertiary Hospital': { Icon: Hospital, badge: 'T' },
  'National Central Hospital': { Icon: Hospital, badge: 'C' },
  'Medical Centre': { Icon: Stethoscope },
}

export function FacilityTypeIcon({ type }) {
  const { Icon, badge } = ICONS_BY_TYPE[type] || ICONS_BY_TYPE.Clinic
  return <span className="facility-type-symbol" aria-hidden="true">
    <Icon size={20} strokeWidth={2.2} />
    {badge && <span className="facility-type-badge">{badge === 'clock' ? <Clock3 size={11} strokeWidth={2.5} /> : badge}</span>}
  </span>
}

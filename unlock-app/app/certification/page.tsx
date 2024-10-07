import { Metadata } from 'next'
import CertificationContent from '~/components/content/certification/CertificationContent'

export const metadata: Metadata = {
  title: 'Unlock Certification',
  description:
    'Bring your certification or credentialing program onchain with Unlock.',
}

export default function CertificationPage() {
  return <CertificationContent />
}

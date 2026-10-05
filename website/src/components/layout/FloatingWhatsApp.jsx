import { useContent } from '../../context/ContentContext';
import { whatsappLink } from '../../utils/format';
import { WhatsappIcon } from '../ui/SocialIcons';

export default function FloatingWhatsApp() {
  const { contact } = useContent();
  const href = whatsappLink(contact.whatsapp || contact.phone, contact.whatsappMessage);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 bottom-4 z-40 flex size-14 items-center justify-center rounded-full bg-[#1fa855] text-white shadow-[0_12px_30px_-8px_rgb(0_0_0/0.7)] transition hover:scale-105 sm:right-6 sm:bottom-6"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <WhatsappIcon className="size-7" />
    </a>
  );
}

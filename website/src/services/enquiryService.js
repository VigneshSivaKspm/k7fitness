import { doc, serverTimestamp, setDoc } from 'firebase/firestore/lite';
import { db } from '../firebase/config';
import { phoneDigits } from '../utils/format';

export class EnquiryError extends Error {}

function dayKey(d = new Date()) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * The document ID is derived from phone + date. Security rules only allow
 * creates, so a second submission from the same number on the same day is
 * rejected server-side: a simple, reliable duplicate/spam guard.
 */
export async function submitEnquiry({ name, phone, email, interest, message }) {
  if (!db) {
    // Demo mode: simulate delay and succeed for client demo showcase
    await new Promise((resolve) => setTimeout(resolve, 700));
    return;
  }
  const digits = phoneDigits(phone);
  const payload = {
    name: name.trim(),
    phone: digits,
    email: email.trim(),
    interest: interest.trim(),
    message: message.trim(),
    status: 'new',
    source: 'website',
    createdAt: serverTimestamp(),
  };
  try {
    await setDoc(doc(db, 'enquiries', `${digits}_${dayKey()}`), payload);
  } catch (err) {
    if (err?.code === 'permission-denied') {
      throw new EnquiryError(
        'We have already received an enquiry from this number today. Our team will contact you shortly.',
      );
    }
    if (err?.code === 'unavailable') {
      throw new EnquiryError('You appear to be offline. Please check your connection and try again.');
    }
    throw new EnquiryError('Something went wrong while sending your enquiry. Please try again or call us.');
  }
}

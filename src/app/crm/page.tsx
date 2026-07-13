import { redirect } from 'next/navigation';

export default function CrmPage() {
  // The root CRM page will redirect to the leads page by default.
  redirect('/crm/leads');
}
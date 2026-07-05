'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/firebase/auth-context';

interface Role {
  id: string;
  name: string;
}

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inviteSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  roleId: z.string().uuid({ message: 'Please select a role.' }),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const { currentOrg } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
  });

  useEffect(() => {
    // In a real app, you'd fetch roles from an API
    setRoles([
      { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', name: 'Employee' },
      { id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', name: 'Manager' },
      { id: '7c9e6679-7425-40de-944b-e07fc1f90ae7', name: 'Organization Admin' },
    ]);
  }, []);

  const onSubmit = async (data: InviteFormValues) => {
    if (!currentOrg) return;
    setServerError(null);

    try {
      const response = await fetch('/api/v1/team/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Organization-Id': currentOrg.id,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invitation.');
      }

      // Success, close modal and maybe show a toast
      reset();
      onClose();
    } catch (error) {
      setServerError((error as Error).message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Invite New Member</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700">Email Address</label>
            <input id="email" type="email" {...register('email')} className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="roleId" className="block text-sm font-medium text-zinc-700">Role</label>
            <select id="roleId" {...register('roleId')} className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm">
              <option value="">Select a role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            {errors.roleId && <p className="text-red-500 text-xs mt-1">{errors.roleId.message}</p>}
          </div>
          {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-zinc-300 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50">{isSubmitting ? 'Sending...' : 'Send Invitation'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
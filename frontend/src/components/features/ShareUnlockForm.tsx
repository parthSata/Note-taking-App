'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/features/LoadingButton';
import { apiClient } from '@/lib/api-client';
import { LockKeyhole } from 'lucide-react';

interface ShareUnlockFormProps {
  token: string;
  onSuccess: (data: { title: string; content: string; viewCount: number }) => void;
}

interface UnlockFormValues {
  accessKey: string;
}

export function ShareUnlockForm({ token, onSuccess }: ShareUnlockFormProps) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<UnlockFormValues>();

  const onSubmit = async (data: UnlockFormValues) => {
    setLoading(true);
    try {
      const result = await apiClient<{ title: string; content: string; viewCount: number }>(
        `/api/share/${token}/unlock`,
        {
          method: 'POST',
          body: JSON.stringify({ accessKey: data.accessKey }),
        },
      );
      onSuccess(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid access key';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md border-white/20 bg-white/80 shadow-xl backdrop-blur">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
          <LockKeyhole className="h-6 w-6 text-indigo-600" />
        </div>
        <CardTitle>Password protected</CardTitle>
        <CardDescription>Enter the access key to view this note.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accessKey">Access key</Label>
            <Input
              id="accessKey"
              type="password"
              placeholder="Enter access key"
              autoComplete="off"
              {...register('accessKey', { required: true })}
            />
          </div>
          <LoadingButton type="submit" className="w-full" loading={loading} loadingText="Unlocking...">
            Unlock note
          </LoadingButton>
        </form>
      </CardContent>
    </Card>
  );
}

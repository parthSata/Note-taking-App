'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingButton } from '@/components/features/LoadingButton';
import { ShareLinkCard } from '@/components/features/ShareLinkCard';
import { apiClient } from '@/lib/api-client';
import { createNoteSchema, type CreateNoteInput } from '@note-taking/backend/validations/note.schema';
import type { ShareLinkMeta } from '@note-taking/backend/types';

function getDefaultExpiry(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString();
}

interface CreateNoteResponse {
  note: { id: string; title: string; content: string };
  shareLink: ShareLinkMeta;
}

export function NoteForm() {
  const [result, setResult] = useState<CreateNoteResponse | null>(null);
  const [minDateTime, setMinDateTime] = useState<string | undefined>(undefined);

  useEffect(() => {
    setMinDateTime(new Date().toISOString().slice(0, 16));
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateNoteInput>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      shareType: 'TIME_BASED',
      accessType: 'PUBLIC',
      expiresAt: getDefaultExpiry(),
    },
  });

  const shareType = watch('shareType');
  const accessType = watch('accessType');

  const onSubmit = async (data: CreateNoteInput) => {
    try {
      const response = await apiClient<CreateNoteResponse>('/api/notes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setResult(response);
      toast.success('Note created successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create note';
      toast.error(message);
    }
  };

  if (result) {
    return <ShareLinkCard shareLink={result.shareLink} noteId={result.note.id} />;
  }

  return (
    <Card className="border-white/20 bg-white/80 shadow-xl backdrop-blur">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Create a note</CardTitle>
        <CardDescription>Add content and configure how your share link works.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Meeting notes" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your note here..."
              rows={6}
              {...register('content')}
            />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Share type</Label>
              <Select
                value={shareType}
                onValueChange={(value) => {
                  if (value) setValue('shareType', value as 'ONE_TIME' | 'TIME_BASED');
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONE_TIME">One-time</SelectItem>
                  <SelectItem value="TIME_BASED">Time-based</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Access type</Label>
              <Select
                value={accessType}
                onValueChange={(value) => {
                  if (value) setValue('accessType', value as 'PUBLIC' | 'PASSWORD');
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="PASSWORD">Password protected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expires at</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              min={minDateTime}
              onChange={(e) => {
                const value = e.target.value;
                if (value) {
                  setValue('expiresAt', new Date(value).toISOString(), { shouldValidate: true });
                }
              }}
            />
            {errors.expiresAt && (
              <p className="text-sm text-destructive">{errors.expiresAt.message}</p>
            )}
          </div>

          <LoadingButton
            type="submit"
            className="w-full bg-linear-to-r from-indigo-500 to-violet-600"
            loading={isSubmitting}
            loadingText="Creating..."
          >
            Create note & share link
          </LoadingButton>
        </form>
      </CardContent>
    </Card>
  );
}

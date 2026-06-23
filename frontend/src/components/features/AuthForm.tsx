import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/features/LoadingButton';
import { apiClient } from '@/lib/api-client';
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '@note-taking/backend/validations/auth.schema';
import type { AuthUser } from '@note-taking/backend/types';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === 'register';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput | LoginInput>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
  });

  // Remove leaked credentials from URL if native form submit occurred
  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const onSubmit = async (data: RegisterInput | LoginInput) => {
    try {
      await apiClient<{ user: AuthUser }>(`/api/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      toast.success(isRegister ? 'Account created!' : 'Welcome back!');
      // Full navigation ensures auth cookie is applied before protected routes load
      window.location.assign('/notes');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast.error(message);
    }
  };

  return (
    <Card className="w-full max-w-md border-white/20 bg-white/80 shadow-xl backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold">
          {isRegister ? 'Create account' : 'Welcome back'}
        </CardTitle>
        <CardDescription>
          {isRegister
            ? 'Start sharing secure notes in seconds'
            : 'Sign in to manage your notes'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
          }}
          className="space-y-4"
        >
          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                autoComplete="name"
                placeholder="Jane Doe"
                {...register('name' as keyof RegisterInput)}
              />
              {'name' in errors && errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('confirmPassword' as keyof RegisterInput)}
              />
              {'confirmPassword' in errors && errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          )}

          <LoadingButton
            type="button"
            className="w-full bg-linear-to-r from-indigo-500 to-violet-600"
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {isRegister ? 'Create account' : 'Sign in'}
          </LoadingButton>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link
            to={isRegister ? '/login' : '/register'}
            className="font-medium text-indigo-600 hover:underline"
          >
            {isRegister ? 'Sign in' : 'Register'}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

// app/components/dashboard/student/join-class-form.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { toast } from '@/app/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';

const joinClassSchema = z.object({
  code: z
    .string()
    .length(6, 'The class code must be 6 characters')
    .regex(/^[A-Z0-9]+$/, 'Only uppercase letters and numbers are allowed'),
});

type JoinClassFormData = z.infer<typeof joinClassSchema>;

export function JoinClassForm() {
  const joinClass = useMutation(api.classes.joinClass);
  const [isJoining, setIsJoining] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JoinClassFormData>({
    resolver: zodResolver(joinClassSchema),
  });

  const onSubmit = async (data: JoinClassFormData) => {
    try {
      setIsJoining(true);
      await joinClass({ code: data.code.toUpperCase() });
      toast({
        title: 'Successfully joined',
        description: 'You have successfully joined the class',
      });
      reset();
    } catch (error) {
      toast({
        title: 'Failed to join',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join the class</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              {...register('code')}
              placeholder="please enter the class code"
              className="uppercase"
              maxLength={6}
            />
            {errors.code && (
              <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isJoining}>
            {isJoining ? 'joining...' : 'join the class'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

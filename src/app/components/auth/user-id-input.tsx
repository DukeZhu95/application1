import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userIdSchema } from '@/lib/validations';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';

interface UserIdFormData {
  alphanumericId: string;
}

interface UserIdInputProps {
  onIdSubmit: (id: string) => void;
}

export function UserIdInput({ onIdSubmit }: UserIdInputProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserIdFormData>({
    resolver: zodResolver(userIdSchema),
  });

  const onSubmit = (data: UserIdFormData) => {
    onIdSubmit(data.alphanumericId);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register('alphanumericId')}
          placeholder="Enter 6-character ID"
          className="uppercase"
          maxLength={6}
          onChange={(e) => {
            e.target.value = e.target.value.toUpperCase();
            register('alphanumericId')
              .onChange(e)
              .then((r) => r);
          }}
        />
        {errors.alphanumericId && (
          <p className="text-sm text-red-500 mt-1">
            {errors.alphanumericId.message}
          </p>
        )}
      </div>
      <Button type="submit" className="w-full">
        Continue
      </Button>
    </form>
  );
}

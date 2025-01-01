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
    <div className="form-container">
      <div className="form-content">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <Input
              {...register('alphanumericId')}
              placeholder="Enter 6-character ID"
              className="form-input uppercase"
              maxLength={6}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
                register('alphanumericId')
                  .onChange(e)
                  .then((r) => r);
              }}
            />
          </div>
          {errors.alphanumericId && (
            <p className="form-error">{errors.alphanumericId.message}</p>
          )}
          <Button type="submit" className="form-button">
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
}

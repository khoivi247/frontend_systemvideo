import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStudent } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import toast from 'react-hot-toast';
import { flushSync } from 'react-dom';

interface StudentFormData {
  name: string;
  className: string;
}

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setStudent } = useStudent();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<StudentFormData>();

  const onSubmit = (data: StudentFormData) => {
    setLoading(true);
    try {
      flushSync(() => {
        setStudent({ name: data.name, className: data.className });
      });
      toast.success('Chào mừng!');
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Video Class System</h1>
          <p className="mt-2 text-gray-600">Nhập thông tin để tiếp tục</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Họ tên"
              type="text"
              placeholder="Nguyễn Văn A"
              error={errors.name?.message}
              {...register('name', {
                required: 'Họ tên là bắt buộc',
                minLength: { value: 2, message: 'Tối thiểu 2 ký tự' },
              })}
              autoComplete="name"
            />

            <Input
              label="Lớp"
              type="text"
              placeholder="Ví dụ: 12A1, CNTT-K1, DH23..."
              error={errors.className?.message}
              {...register('className', { required: 'Lớp là bắt buộc' })}
              autoComplete="off"
            />

            <Button type="submit" className="w-full" loading={loading}>
              Tiếp tục
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import toast from 'react-hot-toast';
import { flushSync } from 'react-dom';

const ADMIN_PASSCODE = '17122011';

interface StudentFormData {
  name: string;
  className: string;
  passcode?: string;
}

export function LoginForm() {
  const navigate = useNavigate();
  const { setStudent } = useStudent();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<StudentFormData>();

  const className = watch('className');

  // Show passcode field when className is "admin" (case insensitive)
  const isAdminClass = className?.toLowerCase() === 'admin';

  const onSubmit = (data: StudentFormData) => {
    setLoading(true);
    try {
      const isAdmin = data.passcode === ADMIN_PASSCODE;
      
      flushSync(() => {
        setStudent({ 
          id: `temp-${Date.now()}`, 
          name: data.name, 
          className: data.className, 
          email: `${data.name.toLowerCase().replace(/\s+/g, '.')}@student.local`,
          isAdmin,
        });
      });
      
      toast.success(isAdmin ? 'Chào mừng Admin!' : '10a2 xin chào');
      
      // Redirect: admin -> /admin, student -> /dashboard
      const redirectPath = isAdmin ? '/admin' : '/dashboard';
      navigate(redirectPath, { replace: true });
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
              placeholder="ĐẦY ĐỦ HỌ VÀ TÊN!"
              error={errors.name?.message}
              {...register('name', {
                required: 'Họ tên là bắt buộc. nhập đầy đủ HỌ VÀ TÊN',
                minLength: { value: 2, message: 'Tối thiểu 2 ký tự' },
              })}
              autoComplete="name"
            />

            <Input
              label="Lớp"
              type="text"
              placeholder="Ví dụ: 10a2 (nhập 'admin' để có quyền Admin)"
              error={errors.className?.message}
              {...register('className', { required: 'Lớp là bắt buộc' })}
              autoComplete="off"
            />

            {isAdminClass && (
              <Input
                label="Mã truy cập Admin"
                type="password"
                placeholder="Nhập mã passcode"
                error={errors.passcode?.message}
                {...register('passcode', { 
                  required: 'm tưởng m là t à?',
                  minLength: { value: 1, message: 'Nhập mã passcode' },
                })}
                autoComplete="off"
              />
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Tiếp tục
            </Button>
          </form>
          
          <p className="mt-4 text-center text-sm text-gray-500">
            Nhập lớp <strong>admin</strong> để log admin
          </p>
        </div>
      </div>
    </div>
  );
}

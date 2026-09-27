import { useParams } from 'react-router-dom';

export default function TestPage() {
  const { token } = useParams<{ token: string }>();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-green-600">✅ Route Works!</h1>
        <p className="mt-4 text-gray-600">Token: <code className="bg-gray-100 px-2 py-1 rounded">{token}</code></p>
        <p className="mt-2 text-sm text-gray-500">Nếu thấy trang này, React Router đang hoạt động</p>
      </div>
    </div>
  );
}

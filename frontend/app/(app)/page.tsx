import { redirect } from 'next/navigation';

export default function HomePage() {
  // A rota principal redireciona automaticamente para o Login
  redirect('/login');
}
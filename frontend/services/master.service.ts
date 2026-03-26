import axios from 'axios';

// URL do seu backend no Render
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/agendar'
});

export async function buscarSaloesMaster() {
  const response = await api.get('/master/saloes');
  return response.data;
}

export async function atualizarStatusSalao(id: string, ativo: boolean) {
  const response = await api.patch(`/master/saloes/${id}`, { ativo });
  return response.data;
}
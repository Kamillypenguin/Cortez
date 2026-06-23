const BASE_URL = 'http://localhost:3001'

function getToken() { return localStorage.getItem('token') }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data as T
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type UserDTO = {
  id: string; nome: string; email: string
  fotoPerfil: string | null; cargo: string | null; status: string
}

export type AuthResult = {
  user: UserDTO; accessToken: string; refreshToken: string
}

export type AmbienteDTO = {
  id: string; nome: string; icone: string | null; cor: string | null
  usuarioId: string; ativo: boolean; createdAt: string
  _count?: { tarefas: number; eventos: number; documentos: number }
}

export type TaskDTO = {
  id: string; titulo: string; descricao: string | null; status: string
  prioridade: string; proj: string; projColor: string; due: string
  durMin: number; usuarioId: string; ambienteId: string | null
  projetoId: string | null; createdAt: string; updatedAt: string
  responsaveis?: { id: string; email: string; nome: string | null }[]
  projeto?: { id: string; nome: string; cor: string } | null
}

export type MindMapDTO = {
  id: string; titulo: string; estrutura: string
  usuarioId: string; ambienteId: string | null
  createdAt: string; updatedAt: string
}

export type RiscoDTO = {
  id: string; titulo: string; descricao: string | null
  severidade: 'critico' | 'atencao' | 'baixo'
  impacto: string | null; status: 'aberto' | 'mitigado' | 'resolvido'
  projetoId: string; usuarioId: string
  createdAt: string; updatedAt: string
}

export type EventDTO = {
  id: string; titulo: string; time: string; loc: string | null
  color: string; dayNum: number; usuarioId: string; ambienteId: string | null
}

export type DocumentDTO = {
  id: string; nome: string; tipo: string; tamanho: string | null
  url: string | null; compartilhado: boolean
  usuarioId: string; ambienteId: string | null; projetoId: string | null
  createdAt: string; updatedAt: string
  acessos?: { email: string; permissao: string }[]
  projeto?: { id: string; nome: string; cor: string } | null
}

export type ProjetoDTO = {
  id: string; nome: string; descricao: string | null
  cor: string; icone: string | null; status: string
  usuarioId: string; ambienteId: string | null
  createdAt: string; updatedAt: string
  _count?: { tarefas: number; membros: number }
  membros?: { email: string; nome: string | null; fotoPerfil: string | null }[]
}

export type MembroTimeDTO = {
  id: string; projetoId: string; email: string; nome: string | null
  fotoPerfil: string | null; papel: string; status: string; online: boolean
  createdAt: string; updatedAt: string
}

export type AtividadeDTO = {
  id: string; projetoId: string; usuarioId: string; nomeUsuario: string
  tipo: string; entidade: string; entidadeId: string | null
  descricao: string; alvo: string | null; createdAt: string
}

export type ComentarioDTO = {
  id: string; texto: string; usuarioId: string
  tarefaId: string | null; documentId: string | null; createdAt: string; updatedAt: string
  usuario?: { id: string; nome: string; fotoPerfil: string | null }
}

export type MensagemDTO = {
  id: string; chatId: string; usuarioId: string
  mensagem: string; resposta: string | null; createdAt: string
}

export type ChatDTO = {
  id: string; titulo: string | null; usuarioId: string
  ambienteId: string | null; createdAt: string; updatedAt: string
  _count?: { mensagens: number }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  register: (body: { nome: string; email: string; senha: string; cargo?: string }) =>
    request<AuthResult>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; senha: string }) =>
    request<AuthResult>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  refresh: (refreshToken: string) =>
    request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST', body: JSON.stringify({ refreshToken }),
    }),

  logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),

  me: () => request<{ user: UserDTO }>('/auth/me'),

  googleUrl: () => `${BASE_URL}/auth/google`,
  microsoftUrl: () => `${BASE_URL}/auth/microsoft`,
}

// ─── Usuário ──────────────────────────────────────────────────────────────────

export const user = {
  profile: () => request<UserDTO & { _count: Record<string, number> }>('/api/user/profile'),

  updateProfile: (body: { nome?: string; cargo?: string; fotoPerfil?: string }) =>
    request<UserDTO>('/api/user/profile', { method: 'PUT', body: JSON.stringify(body) }),

  dashboard: () => request<{
    usuario: UserDTO
    tarefasHoje: TaskDTO[]
    eventos: EventDTO[]
    estatisticas: { total: number; done: number; partial: number; pending: number }
  }>('/api/user/dashboard'),
}

// ─── Ambientes ────────────────────────────────────────────────────────────────

export const ambientes = {
  list: () => request<AmbienteDTO[]>('/api/ambientes'),

  create: (body: { nome: string; icone?: string; cor?: string }) =>
    request<AmbienteDTO>('/api/ambientes', { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, body: { nome?: string; icone?: string; cor?: string }) =>
    request<AmbienteDTO>(`/api/ambientes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  remove: (id: string) =>
    request<{ ok: boolean }>(`/api/ambientes/${id}`, { method: 'DELETE' }),

  getWithData: (id: string) =>
    request<AmbienteDTO & { tarefas: TaskDTO[]; eventos: EventDTO[] }>(`/api/ambientes/${id}`),
}

// ─── Tarefas ──────────────────────────────────────────────────────────────────

export const tasks = {
  list: (ambienteId?: string) =>
    request<TaskDTO[]>(`/api/tasks${ambienteId ? `?ambienteId=${ambienteId}` : ''}`),

  create: (body: { titulo: string; proj: string; projColor?: string; prioridade?: string; due: string; durMin?: number; ambienteId?: string }) =>
    request<TaskDTO>('/api/tasks', { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, body: Partial<{ titulo: string; status: string; prioridade: string; proj: string; projColor: string; due: string; durMin: number; ambienteId: string | null }>) =>
    request<TaskDTO>(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  remove: (id: string) =>
    request<{ ok: boolean }>(`/api/tasks/${id}`, { method: 'DELETE' }),
}

// ─── Eventos ──────────────────────────────────────────────────────────────────

export const events = {
  list: (day?: number, ambienteId?: string) => {
    const params = new URLSearchParams()
    if (day !== undefined) params.set('day', String(day))
    if (ambienteId) params.set('ambienteId', ambienteId)
    return request<EventDTO[]>(`/api/events${params.toString() ? '?' + params : ''}`)
  },

  create: (body: { titulo: string; time: string; loc?: string; color?: string; dayNum: number; ambienteId?: string }) =>
    request<EventDTO>('/api/events', { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, body: Partial<{ titulo: string; time: string; loc: string; color: string; dayNum: number }>) =>
    request<EventDTO>(`/api/events/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  remove: (id: string) =>
    request<{ ok: boolean }>(`/api/events/${id}`, { method: 'DELETE' }),
}

// ─── Documentos ───────────────────────────────────────────────────────────────

export const documents = {
  list: (params?: { ambienteId?: string; projetoId?: string }) => {
    const q = new URLSearchParams()
    if (params?.ambienteId) q.set('ambienteId', params.ambienteId)
    if (params?.projetoId) q.set('projetoId', params.projetoId)
    return request<DocumentDTO[]>(`/api/documents${q.toString() ? '?' + q : ''}`)
  },

  create: (body: { nome: string; tipo: string; tamanho?: string; url?: string; ambienteId?: string; projetoId?: string }) =>
    request<DocumentDTO>('/api/documents', { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, body: Partial<{ nome: string; tipo: string; tamanho: string; url: string; projetoId: string | null }>) =>
    request<DocumentDTO>(`/api/documents/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  share: (id: string, email: string, permissao: 'view' | 'edit' = 'view') =>
    request<{ ok: boolean }>(`/api/documents/${id}/share`, {
      method: 'POST', body: JSON.stringify({ email, permissao }),
    }),

  revokeShare: (id: string, email: string) =>
    request<{ ok: boolean }>(`/api/documents/${id}/share/${encodeURIComponent(email)}`, { method: 'DELETE' }),

  remove: (id: string) =>
    request<{ ok: boolean }>(`/api/documents/${id}`, { method: 'DELETE' }),
}

// ─── Projetos ─────────────────────────────────────────────────────────────────

export const projetos = {
  list: (ambienteId?: string) =>
    request<ProjetoDTO[]>(`/api/projetos${ambienteId ? `?ambienteId=${ambienteId}` : ''}`),

  get: (id: string) =>
    request<ProjetoDTO & { tarefas: TaskDTO[]; documentos: DocumentDTO[]; membros: MembroTimeDTO[]; atividades: AtividadeDTO[] }>(`/api/projetos/${id}`),

  create: (body: { nome: string; descricao?: string; cor?: string; icone?: string; ambienteId?: string }) =>
    request<ProjetoDTO>('/api/projetos', { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, body: Partial<{ nome: string; descricao: string; cor: string; icone: string; status: string }>) =>
    request<ProjetoDTO>(`/api/projetos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  remove: (id: string) =>
    request<{ ok: boolean }>(`/api/projetos/${id}`, { method: 'DELETE' }),

  // Membros
  listMembros: (projetoId: string) =>
    request<MembroTimeDTO[]>(`/api/projetos/${projetoId}/membros`),

  addMembro: (projetoId: string, body: { email: string; nome?: string; papel?: string }) =>
    request<MembroTimeDTO>(`/api/projetos/${projetoId}/membros`, { method: 'POST', body: JSON.stringify(body) }),

  removeMembro: (projetoId: string, email: string) =>
    request<{ ok: boolean }>(`/api/projetos/${projetoId}/membros/${encodeURIComponent(email)}`, { method: 'DELETE' }),

  // Atividades
  listAtividades: (projetoId: string) =>
    request<AtividadeDTO[]>(`/api/projetos/${projetoId}/atividades`),
}

// ─── Comentários ──────────────────────────────────────────────────────────────

export const comentarios = {
  list: (params: { tarefaId?: string; documentId?: string }) => {
    const q = new URLSearchParams()
    if (params.tarefaId) q.set('tarefaId', params.tarefaId)
    if (params.documentId) q.set('documentId', params.documentId)
    return request<ComentarioDTO[]>(`/api/comentarios?${q}`)
  },

  create: (body: { texto: string; tarefaId?: string; documentId?: string }) =>
    request<ComentarioDTO>('/api/comentarios', { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, texto: string) =>
    request<ComentarioDTO>(`/api/comentarios/${id}`, { method: 'PUT', body: JSON.stringify({ texto }) }),

  remove: (id: string) =>
    request<{ ok: boolean }>(`/api/comentarios/${id}`, { method: 'DELETE' }),
}

// ─── Riscos ───────────────────────────────────────────────────────────────────

export const riscos = {
  list: (projetoId: string) =>
    request<RiscoDTO[]>(`/api/riscos?projetoId=${projetoId}`),

  create: (body: { titulo: string; descricao?: string; severidade?: string; impacto?: string; projetoId: string }) =>
    request<RiscoDTO>('/api/riscos', { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, body: Partial<{ titulo: string; descricao: string; severidade: string; impacto: string; status: string }>) =>
    request<RiscoDTO>(`/api/riscos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  remove: (id: string) =>
    request<{ ok: boolean }>(`/api/riscos/${id}`, { method: 'DELETE' }),
}

// ─── Mapas Mentais ────────────────────────────────────────────────────────────

export const mindmaps = {
  list: (ambienteId?: string) =>
    request<MindMapDTO[]>(`/api/mindmaps${ambienteId ? `?ambienteId=${ambienteId}` : ''}`),

  get: (id: string) =>
    request<MindMapDTO>(`/api/mindmaps/${id}`),

  create: (body: { titulo: string; estrutura?: string; ambienteId?: string }) =>
    request<MindMapDTO>('/api/mindmaps', { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, body: { titulo?: string; estrutura?: string }) =>
    request<MindMapDTO>(`/api/mindmaps/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  remove: (id: string) =>
    request<{ ok: boolean }>(`/api/mindmaps/${id}`, { method: 'DELETE' }),
}

// ─── Chat IA ──────────────────────────────────────────────────────────────────

export const chatia = {
  listChats: (ambienteId?: string) =>
    request<ChatDTO[]>(`/api/chatia${ambienteId ? `?ambienteId=${ambienteId}` : ''}`),

  createChat: (body: { titulo?: string; ambienteId?: string }) =>
    request<ChatDTO>('/api/chatia', { method: 'POST', body: JSON.stringify(body) }),

  getMessages: (chatId: string) =>
    request<MensagemDTO[]>(`/api/chatia/${chatId}/messages`),

  sendMessage: (chatId: string, mensagem: string, resposta?: string) =>
    request<MensagemDTO>(`/api/chatia/${chatId}/messages`, {
      method: 'POST', body: JSON.stringify({ mensagem, resposta }),
    }),

  deleteChat: (chatId: string) =>
    request<{ ok: boolean }>(`/api/chatia/${chatId}`, { method: 'DELETE' }),
}

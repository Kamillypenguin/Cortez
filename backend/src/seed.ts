import { PrismaClient } from '@prisma/client'
import { hashPassword } from './utils/password'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // ── Usuário demo ───────────────────────────────────────────────────────────
  const senhaHash = await hashPassword('Demo@123')

  const user = await prisma.user.upsert({
    where: { email: 'kamil@organizeragend.com' },
    update: { senhaHash },
    create: {
      nome: 'Mariana Silva',
      email: 'kamil@organizeragend.com',
      senhaHash,
      cargo: 'estudante',
    },
  })
  console.log('✅ Usuário:', user.email)

  // ── Ambiente ───────────────────────────────────────────────────────────────
  const ambiente = await prisma.ambiente.upsert({
    where: { id: 'seed-ambiente-faculdade' },
    update: {},
    create: {
      id: 'seed-ambiente-faculdade',
      nome: 'Faculdade',
      icone: 'school',
      cor: '#6366F1',
      usuarioId: user.id,
    },
  })
  console.log('✅ Ambiente:', ambiente.nome)

  // ── Projetos ───────────────────────────────────────────────────────────────
  const projTCC = await prisma.projeto.upsert({
    where: { id: 'seed-proj-tcc' },
    update: {},
    create: {
      id: 'seed-proj-tcc',
      nome: 'TCC · Visão Computacional',
      descricao: 'Trabalho de Conclusão de Curso sobre detecção de objetos com YOLO',
      cor: '#6366F1',
      icone: 'brain',
      status: 'ativo',
      usuarioId: user.id,
      ambienteId: ambiente.id,
    },
  })

  const projEstat = await prisma.projeto.upsert({
    where: { id: 'seed-proj-estat' },
    update: {},
    create: {
      id: 'seed-proj-estat',
      nome: 'Disciplina · Estatística',
      descricao: 'Disciplina obrigatória — listas e provas',
      cor: '#10B981',
      icone: 'chart-bar',
      status: 'ativo',
      usuarioId: user.id,
      ambienteId: ambiente.id,
    },
  })

  const projIC = await prisma.projeto.upsert({
    where: { id: 'seed-proj-ic' },
    update: {},
    create: {
      id: 'seed-proj-ic',
      nome: 'Iniciação Científica',
      descricao: 'Pesquisa em processamento de imagens médicas',
      cor: '#F59E0B',
      icone: 'microscope',
      status: 'ativo',
      usuarioId: user.id,
      ambienteId: ambiente.id,
    },
  })

  const projMono = await prisma.projeto.upsert({
    where: { id: 'seed-proj-mono' },
    update: {},
    create: {
      id: 'seed-proj-mono',
      nome: 'Monografia parcial',
      descricao: 'Escrita da monografia do curso de especialização',
      cor: '#EF4444',
      icone: 'file-text',
      status: 'pausado',
      usuarioId: user.id,
      ambienteId: ambiente.id,
    },
  })

  const projGrupo = await prisma.projeto.upsert({
    where: { id: 'seed-proj-grupo' },
    update: {},
    create: {
      id: 'seed-proj-grupo',
      nome: 'Grupo de Estudos',
      descricao: 'Grupo semanal de estudos em ML',
      cor: '#8B5CF6',
      icone: 'users',
      status: 'ativo',
      usuarioId: user.id,
      ambienteId: ambiente.id,
    },
  })

  console.log('✅ Projetos:', [projTCC, projEstat, projIC, projMono, projGrupo].map(p => p.nome).join(', '))

  // ── Membros do time ────────────────────────────────────────────────────────
  const membros = [
    { projetoId: projTCC.id,   email: 'ana.clara@uni.br', nome: 'Ana Clara',   papel: 'membro', status: 'ativo' },
    { projetoId: projTCC.id,   email: 'bruno@uni.br',     nome: 'Bruno Souza', papel: 'membro', status: 'ativo' },
    { projetoId: projTCC.id,   email: 'prof.lima@uni.br', nome: 'Prof. Lima',  papel: 'admin',  status: 'ativo' },
    { projetoId: projGrupo.id, email: 'carla@uni.br',     nome: 'Carla Matos', papel: 'membro', status: 'ativo' },
    { projetoId: projGrupo.id, email: 'diego@uni.br',     nome: 'Diego Nunes', papel: 'membro', status: 'ativo' },
    { projetoId: projIC.id,    email: 'prof.costa@uni.br',nome: 'Prof. Costa', papel: 'admin',  status: 'ativo' },
  ]
  for (const m of membros) {
    await prisma.membroTime.upsert({
      where: { projetoId_email: { projetoId: m.projetoId, email: m.email } },
      update: {},
      create: m,
    })
  }
  console.log('✅ Membros do time criados')

  // ── Tarefas vinculadas a projetos ──────────────────────────────────────────
  const tarefas = [
    { id: 'seed-task-1', titulo: 'Estudar estatística',     descricao: 'Lista 5 — distribuições contínuas',      status: 'none',    prioridade: 'urgent',    proj: 'Disciplina · Estatística',  projColor: '#10B981', due: 'hoje',        durMin: 30,  usuarioId: user.id, ambienteId: ambiente.id, projetoId: projEstat.id },
    { id: 'seed-task-2', titulo: 'Escrever capítulo 3 TCC', descricao: 'Metodologia e arquitetura YOLO',         status: 'partial', prioridade: 'urgent',    proj: 'TCC · Visão Computacional', projColor: '#6366F1', due: 'amanhã',      durMin: 120, usuarioId: user.id, ambienteId: ambiente.id, projetoId: projTCC.id },
    { id: 'seed-task-3', titulo: 'Revisar cap. 3 do TCC',   descricao: 'Revisão com Ana Clara e Bruno',          status: 'none',    prioridade: 'attention', proj: 'TCC · Visão Computacional', projColor: '#6366F1', due: 'amanhã',      durMin: 60,  usuarioId: user.id, ambienteId: ambiente.id, projetoId: projTCC.id },
    { id: 'seed-task-4', titulo: 'Montar slides IC v1',      descricao: 'Apresentação inicial para orientador',   status: 'none',    prioridade: 'normal',    proj: 'Iniciação Científica',       projColor: '#F59E0B', due: 'esta semana', durMin: 90,  usuarioId: user.id, ambienteId: ambiente.id, projetoId: projIC.id },
    { id: 'seed-task-5', titulo: 'Sincronizar Zotero',       descricao: 'Atualizar biblioteca de referências',    status: 'done',    prioridade: 'normal',    proj: 'TCC · Visão Computacional', projColor: '#6366F1', due: 'hoje',        durMin: 20,  usuarioId: user.id, ambienteId: ambiente.id, projetoId: projTCC.id },
    { id: 'seed-task-6', titulo: 'Preparar pauta reunião',   descricao: 'Reunião semanal do grupo de estudos',    status: 'none',    prioridade: 'attention', proj: 'Grupo de Estudos',           projColor: '#8B5CF6', due: 'hoje',        durMin: 30,  usuarioId: user.id, ambienteId: ambiente.id, projetoId: projGrupo.id },
    { id: 'seed-task-7', titulo: 'Corrigir prova parcial',   descricao: 'Correção da P1 de Estatística',         status: 'none',    prioridade: 'attention', proj: 'Disciplina · Estatística',  projColor: '#10B981', due: 'esta semana', durMin: 45,  usuarioId: user.id, ambienteId: ambiente.id, projetoId: projEstat.id },
  ]
  for (const t of tarefas) {
    await prisma.task.upsert({ where: { id: t.id }, update: {}, create: t })
  }
  console.log('✅ Tarefas criadas')

  // ── Responsáveis por tarefas ───────────────────────────────────────────────
  const responsaveis = [
    { tarefaId: 'seed-task-3', email: 'ana.clara@uni.br', nome: 'Ana Clara' },
    { tarefaId: 'seed-task-3', email: 'bruno@uni.br',     nome: 'Bruno Souza' },
    { tarefaId: 'seed-task-4', email: 'diego@uni.br',     nome: 'Diego Nunes' },
    { tarefaId: 'seed-task-5', email: 'ana.clara@uni.br', nome: 'Ana Clara' },
    { tarefaId: 'seed-task-5', email: 'bruno@uni.br',     nome: 'Bruno Souza' },
    { tarefaId: 'seed-task-5', email: 'carla@uni.br',     nome: 'Carla Matos' },
  ]
  for (const r of responsaveis) {
    await prisma.tarefaResponsavel.upsert({
      where: { tarefaId_email: { tarefaId: r.tarefaId, email: r.email } },
      update: {},
      create: r,
    })
  }
  console.log('✅ Responsáveis atribuídos')

  // ── Eventos ────────────────────────────────────────────────────────────────
  const eventos = [
    { id: 'seed-ev-1', titulo: 'Estudar estatística', time: '08:00', color: '#10B981', dayNum: 2, usuarioId: user.id, ambienteId: ambiente.id },
    { id: 'seed-ev-2', titulo: 'Reunião TCC',         time: '14:00', color: '#6366F1', dayNum: 3, usuarioId: user.id, ambienteId: ambiente.id },
    { id: 'seed-ev-3', titulo: 'Grupo de estudos',    time: '19:00', color: '#8B5CF6', dayNum: 5, usuarioId: user.id, ambienteId: ambiente.id },
  ]
  for (const e of eventos) {
    await prisma.event.upsert({ where: { id: e.id }, update: {}, create: e })
  }
  console.log('✅ Eventos criados')

  // ── Documentos ─────────────────────────────────────────────────────────────
  const documentos = [
    { id: 'seed-doc-1', nome: 'Cap3_revisao_2.docx',      tipo: 'docx', tamanho: '1.2 MB', usuarioId: user.id, ambienteId: ambiente.id, projetoId: projTCC.id },
    { id: 'seed-doc-2', nome: 'dataset_resultados.xlsx',  tipo: 'xlsx', tamanho: '4.8 MB', usuarioId: user.id, ambienteId: ambiente.id, projetoId: projIC.id },
    { id: 'seed-doc-3', nome: 'diagrama_arquitetura.png', tipo: 'png',  tamanho: '890 KB', usuarioId: user.id, ambienteId: ambiente.id, projetoId: projTCC.id },
    { id: 'seed-doc-4', nome: 'lista_5_enunciado.pdf',    tipo: 'pdf',  tamanho: '320 KB', usuarioId: user.id, ambienteId: ambiente.id, projetoId: projEstat.id },
  ]
  for (const d of documentos) {
    await prisma.document.upsert({ where: { id: d.id }, update: {}, create: d })
  }
  console.log('✅ Documentos criados')

  // ── Atividades do time ─────────────────────────────────────────────────────
  const atividades = [
    { id: 'seed-atv-1', projetoId: projTCC.id,   usuarioId: user.id, nomeUsuario: 'Prof. Costa', tipo: 'comentou',    entidade: 'Document', entidadeId: 'seed-doc-1',  descricao: 'comentou em Cap3_revisao_2.docx',    alvo: 'Cap3_revisao_2.docx' },
    { id: 'seed-atv-2', projetoId: projTCC.id,   usuarioId: user.id, nomeUsuario: 'Lucas M.',    tipo: 'compartilhou', entidade: 'Document', entidadeId: 'seed-doc-2', descricao: 'compartilhou um arquivo',             alvo: 'dataset_v2.xlsx' },
    { id: 'seed-atv-3', projetoId: projTCC.id,   usuarioId: user.id, nomeUsuario: 'Bruno Souza', tipo: 'concluiu',    entidade: 'Task',     entidadeId: 'seed-task-5', descricao: 'concluiu Sincronizar Zotero',         alvo: 'Sincronizar Zotero' },
    { id: 'seed-atv-4', projetoId: projEstat.id, usuarioId: user.id, nomeUsuario: 'Prof. Lima',  tipo: 'criou',       entidade: 'Task',     entidadeId: 'seed-task-7', descricao: 'criou tarefa Corrigir prova parcial', alvo: 'Corrigir prova parcial' },
  ]
  for (const a of atividades) {
    await prisma.atividadeTime.upsert({ where: { id: a.id }, update: {}, create: a })
  }
  console.log('✅ Atividades do time criadas')

  // ── Riscos ─────────────────────────────────────────────────────────────────
  const riscosData = [
    { id: 'seed-risco-1', titulo: 'Entrega do cap. 4 atrasada', descricao: 'Capítulo 4 do TCC ainda não iniciado, prazo em 2 semanas.', severidade: 'critico', impacto: 'Atrasa defesa em ~1 mês', status: 'aberto', projetoId: 'seed-proj-tcc', usuarioId: user.id },
    { id: 'seed-risco-2', titulo: 'Falta de dados para IC', descricao: 'Dataset necessário ainda não foi aprovado pelo orientador.', severidade: 'critico', impacto: 'Bloqueia análise e publicação', status: 'aberto', projetoId: 'seed-proj-ic', usuarioId: user.id },
    { id: 'seed-risco-3', titulo: 'Reunião de orientação cancelada', descricao: 'Reunião de orientação do TCC foi cancelada sem reagendamento.', severidade: 'atencao', impacto: 'Sem feedback do orientador por 2 semanas', status: 'mitigado', projetoId: 'seed-proj-tcc', usuarioId: user.id },
    { id: 'seed-risco-4', titulo: 'Prazo de submissão da monografia', descricao: 'Data limite de submissão da monografia na biblioteca digital.', severidade: 'atencao', impacto: 'Perda de período letivo', status: 'aberto', projetoId: 'seed-proj-mono', usuarioId: user.id },
  ]
  for (const r of riscosData) {
    await prisma.risco.upsert({ where: { id: r.id }, update: {}, create: r })
  }
  console.log('✅ Riscos criados')

  // ── Mapas Mentais ──────────────────────────────────────────────────────────
  const mapaTCC = {
    nodes: [
      { id: 'n0', label: 'TCC\nVisão Comp.', x: 0, y: 0, color: '#6366F1', parentId: null, collapsed: false, shape: 'oval' },
      { id: 'n1', label: 'Metodologia', x: 220, y: -120, color: '#10B981', parentId: 'n0', collapsed: false, shape: 'rect' },
      { id: 'n2', label: 'Resultados', x: 220, y: 0, color: '#F59E0B', parentId: 'n0', collapsed: false, shape: 'rect' },
      { id: 'n3', label: 'Conclusão', x: 220, y: 120, color: '#EC4899', parentId: 'n0', collapsed: false, shape: 'rect' },
      { id: 'n4', label: 'YOLO v8', x: 440, y: -170, color: '#10B981', parentId: 'n1', collapsed: false, shape: 'oval' },
      { id: 'n5', label: 'Dataset', x: 440, y: -90, color: '#10B981', parentId: 'n1', collapsed: false, shape: 'oval' },
      { id: 'n6', label: 'Acurácia 92%', x: 440, y: 0, color: '#F59E0B', parentId: 'n2', collapsed: false, shape: 'oval' },
      { id: 'n7', label: 'Publicação', x: 440, y: 120, color: '#EC4899', parentId: 'n3', collapsed: false, shape: 'diamond' },
    ],
    edges: [
      { from: 'n0', to: 'n1' }, { from: 'n0', to: 'n2' }, { from: 'n0', to: 'n3' },
      { from: 'n1', to: 'n4' }, { from: 'n1', to: 'n5' },
      { from: 'n2', to: 'n6' }, { from: 'n3', to: 'n7' },
    ],
  }
  const mapaSemanal = {
    nodes: [
      { id: 'n0', label: 'Semana\nJun 22–28', x: 0, y: 0, color: '#3B82F6', parentId: null, collapsed: false, shape: 'oval' },
      { id: 'n1', label: 'Estudo', x: 200, y: -150, color: '#10B981', parentId: 'n0', collapsed: false, shape: 'rect' },
      { id: 'n2', label: 'Trabalho', x: 200, y: 0, color: '#F59E0B', parentId: 'n0', collapsed: false, shape: 'rect' },
      { id: 'n3', label: 'Pessoal', x: 200, y: 150, color: '#EC4899', parentId: 'n0', collapsed: false, shape: 'rect' },
      { id: 'n4', label: 'TCC cap. 4', x: 400, y: -190, color: '#10B981', parentId: 'n1', collapsed: false, shape: 'oval' },
      { id: 'n5', label: 'Revisão IC', x: 400, y: -120, color: '#10B981', parentId: 'n1', collapsed: false, shape: 'oval' },
      { id: 'n6', label: 'Reunião TCC', x: 400, y: 0, color: '#F59E0B', parentId: 'n2', collapsed: false, shape: 'oval' },
      { id: 'n7', label: 'Exercícios', x: 400, y: 120, color: '#EC4899', parentId: 'n3', collapsed: false, shape: 'oval' },
    ],
    edges: [
      { from: 'n0', to: 'n1' }, { from: 'n0', to: 'n2' }, { from: 'n0', to: 'n3' },
      { from: 'n1', to: 'n4' }, { from: 'n1', to: 'n5' },
      { from: 'n2', to: 'n6' }, { from: 'n3', to: 'n7' },
    ],
  }
  const mapasMentais = [
    { id: 'seed-map-1', titulo: 'TCC — Visão Computacional', estrutura: JSON.stringify(mapaTCC), usuarioId: user.id, ambienteId: ambiente.id },
    { id: 'seed-map-2', titulo: 'Planejamento Semanal', estrutura: JSON.stringify(mapaSemanal), usuarioId: user.id, ambienteId: ambiente.id },
  ]
  for (const m of mapasMentais) {
    await prisma.mindMap.upsert({ where: { id: m.id }, update: {}, create: m })
  }
  console.log('✅ Mapas mentais criados')

  // ── Comentários ────────────────────────────────────────────────────────────
  const comentarios = [
    { id: 'seed-com-1', texto: 'Ótima estrutura no capítulo 3! Só ajustar as referências.', usuarioId: user.id, documentId: 'seed-doc-1' },
    { id: 'seed-com-2', texto: 'Precisamos revisar a seção de metodologia antes de entregar.', usuarioId: user.id, tarefaId: 'seed-task-2' },
  ]
  for (const c of comentarios) {
    await prisma.comentario.upsert({ where: { id: c.id }, update: {}, create: c })
  }
  console.log('✅ Comentários criados')

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('   Login: kamil@organizeragend.com / Demo@123')
  console.log('\n   Entidades criadas:')
  console.log('   • 1 usuário + 1 ambiente')
  console.log('   • 5 projetos (TCC, Estatística, IC, Monografia, Grupo)')
  console.log('   • 6 membros do time')
  console.log('   • 7 tarefas com responsáveis')
  console.log('   • 3 eventos')
  console.log('   • 4 documentos')
  console.log('   • 4 atividades do time')
  console.log('   • 2 comentários')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

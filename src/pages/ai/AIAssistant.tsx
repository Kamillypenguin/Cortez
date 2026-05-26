import { useState, useRef, useEffect } from 'react'
import { Sidebar } from '../../components/layout/Sidebar'
import { Icon, Sparkle, Badge, Avatar } from '../../components/ui'

type Msg = {
  from: 'user' | 'ai'
  text?: string
  thinking?: boolean
  card?: {
    title: string
    sections: { h: string; p: string }[]
    common: string
  }
}

const INITIAL: Msg[] = [
  { from: 'user', text: 'Resume os 3 artigos sobre visão computacional que adicionei essa semana e diz o que eles têm em comum.' },
  {
    from: 'ai',
    text: 'Analisei os 3 artigos da sua pasta **TCC · Bibliografia**. Aqui está:',
    card: {
      title: '3 artigos · Visão Computacional',
      sections: [
        { h: 'Beyer et al. — DINOv2 (Meta, 2023)', p: 'Self-supervised learning em escala. Foco em features visuais robustas sem rótulos.' },
        { h: 'Oquab et al. — Visual Features (2024)', p: 'Discute generalização cross-domain. Mesma família de arquiteturas que DINOv2.' },
        { h: 'Liu et al. — ConvNeXt v2 (2023)', p: 'CNN moderna competindo com ViT. Pré-treino com masked autoencoders.' },
      ],
      common: 'Os 3 convergem em: (1) pré-treino auto-supervisionado, (2) avaliação em ImageNet + tarefas downstream, (3) crítica ao supervised learning tradicional.',
    },
  },
  { from: 'user', text: 'Perfeito. Cria um mapa mental disso e adiciona ao meu TCC.' },
  { from: 'ai', thinking: true },
]

const chatHistory = [
  {
    date: 'Hoje',
    items: [
      { id: 'current', t: 'Resumir 3 artigos de VC', sub: 'TCC · Visão Computacional', active: true, sparkle: true },
      { id: 'c2', t: 'Plano de estudo para prova', sub: 'Estatística' },
    ],
  },
  {
    date: 'Ontem',
    items: [
      { id: 'c3', t: 'Email para orientador', sub: '4 mensagens' },
      { id: 'c4', t: 'Gerar slides da apresentação', sub: 'Iniciação Cient.' },
    ],
  },
  {
    date: 'Esta semana',
    items: [
      { id: 'c5', t: 'Comparar livros do curso', sub: '6 mensagens' },
      { id: 'c6', t: 'Resumo da reunião 22/05', sub: '3 mensagens' },
    ],
  },
]

const quickActions = [
  { i: 'file-text', l: 'Resumir documento' },
  { i: 'list-check', l: 'Priorizar meu dia' },
  { i: 'brain', l: 'Gerar mapa mental' },
  { i: 'world', l: 'Pesquisar na web' },
  { i: 'pencil', l: 'Criar conteúdo' },
]

function renderText(text: string) {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

export function AIAssistant() {
  const [nav, setNav] = useState('ai')
  const [messages, setMessages] = useState<Msg[]>(INITIAL)
  const [input, setInput] = useState('')
  const [activeChat, setActiveChat] = useState('current')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const send = () => {
    if (!input.trim()) return
    setMessages(m => [...m, { from: 'user', text: input }, { from: 'ai', thinking: true }])
    setInput('')
    setTimeout(() => {
      setMessages(m => {
        const next = [...m]
        next[next.length - 1] = { from: 'ai', text: 'Pensando neste pedido… (demo)' }
        return next
      })
    }, 1800)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 260px 1fr', height: '100%', background: 'var(--bg-base)', overflow: 'hidden' }}>

      <Sidebar active={nav} onNav={setNav} />

      {/* History sidebar */}
      <aside style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--bd-default)', padding: 14, display: 'flex', flexDirection: 'column' }}>
        <button className="btn btn-ai" style={{ width: '100%', justifyContent: 'center', marginBottom: 14, height: 38 }}>
          <Sparkle size={14} /> Nova conversa
        </button>
        <div className="scroll" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {chatHistory.map(g => (
            <div key={g.date}>
              <div className="t-micro" style={{ color: 'var(--tx-3)', padding: '0 6px 6px' }}>{g.date}</div>
              {g.items.map(it => (
                <button key={it.id} onClick={() => setActiveChat(it.id)} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px',
                  width: '100%', borderRadius: 8,
                  background: activeChat === it.id ? 'var(--c-primary-soft)' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: 2, transition: 'background 120ms',
                }}
                  onMouseOver={e => { if (activeChat !== it.id) (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)' }}
                  onMouseOut={e => { if (activeChat !== it.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  {it.sparkle
                    ? <Sparkle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                    : <Icon name="message" size={14} style={{ marginTop: 2, color: 'var(--tx-3)', flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--tx-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.t}</div>
                    <div style={{ fontSize: 11, color: 'var(--tx-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding: '14px 6px 4px', borderTop: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name="Kamil" size={28} color="#6366F1" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500 }}>Kamil</div>
            <div style={{ fontSize: 10, color: 'var(--tx-3)' }}>Plano Pro · 3.2k tokens hoje</div>
          </div>
          <Icon name="settings" size={14} style={{ color: 'var(--tx-3)', cursor: 'pointer' }} />
        </div>
      </aside>

      {/* Chat area */}
      <main style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 56, borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 14, background: 'var(--bg-surface)', flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              Resumir 3 artigos de VC
              <Badge tone="ai">Contexto: TCC · Visão Computacional</Badge>
            </div>
            <div style={{ fontSize: 11, color: 'var(--tx-3)', marginTop: 2 }}>4 arquivos vinculados · iniciado às 09:24</div>
          </div>
          <button className="btn btn-sm btn-secondary"><Icon name="share" size={13} /> Compartilhar</button>
          <button className="btn btn-sm btn-secondary"><Icon name="download" size={13} /> Exportar</button>
          <button className="icon-btn"><Icon name="dots-vertical" size={16} /></button>
        </header>

        <div ref={scrollRef} className="scroll" style={{ flex: 1, overflow: 'auto', padding: '32px 0' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Context pill */}
            <div style={{ alignSelf: 'center', display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 99 }}>
              <Icon name="paperclip" size={13} style={{ color: 'var(--tx-2)' }} />
              <span style={{ fontSize: 12, color: 'var(--tx-2)' }}>Contexto: 4 PDFs + projeto TCC</span>
            </div>

            {messages.map((m, i) => (
              <div key={i}>
                {m.from === 'user' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <div style={{ maxWidth: 540, background: 'var(--c-primary-soft)', border: '1px solid var(--c-primary-border)', padding: '12px 16px', borderRadius: 14, borderTopRightRadius: 4, fontSize: 14, lineHeight: 1.55 }}>
                      {m.text}
                    </div>
                    <Avatar name="Kamil" size={32} color="#6366F1" />
                  </div>
                )}
                {m.from === 'ai' && (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--grad-ai)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--sh-glow)' }}>
                      <Sparkle size={18} style={{ filter: 'brightness(0) invert(1)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>Assistente</span>
                        <Badge tone="ai">IA</Badge>
                      </div>
                      {m.thinking ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: 'var(--bg-card)', borderRadius: 12, maxWidth: 280 }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <span className="thinking-dot" />
                            <span className="thinking-dot" />
                            <span className="thinking-dot" />
                          </div>
                          <span style={{ fontSize: 13, color: 'var(--tx-2)' }}>Analisando seus dados…</span>
                        </div>
                      ) : (
                        <>
                          {m.text && (
                            <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: m.card ? 14 : 0 }}
                              dangerouslySetInnerHTML={{ __html: renderText(m.text) }} />
                          )}
                          {m.card && (
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--c-primary-border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--sh-glow)' }}>
                              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--bd-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <Icon name="files" size={14} style={{ color: 'var(--c-primary)' }} />
                                  <span style={{ fontSize: 13, fontWeight: 600 }}>{m.card.title}</span>
                                </div>
                                <Badge tone="ai">Gerado por IA</Badge>
                              </div>
                              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {m.card.sections.map((s, j) => (
                                  <div key={j}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx-1)', marginBottom: 4 }}>{s.h}</div>
                                    <div style={{ fontSize: 13, color: 'var(--tx-2)', lineHeight: 1.55 }}>{s.p}</div>
                                  </div>
                                ))}
                                <div style={{ padding: 14, background: 'var(--c-primary-soft)', borderRadius: 8, borderLeft: '3px solid var(--c-primary)' }}>
                                  <div className="t-micro" style={{ color: 'var(--c-primary)', marginBottom: 6 }}>O que têm em comum</div>
                                  <div style={{ fontSize: 13, color: 'var(--tx-1)', lineHeight: 1.55 }}>{m.card.common}</div>
                                </div>
                              </div>
                              <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--bd-default)', display: 'flex', gap: 6 }}>
                                <button className="btn btn-sm btn-secondary"><Icon name="file-plus" size={12} /> Salvar</button>
                                <button className="btn btn-sm btn-secondary"><Icon name="copy" size={12} /> Copiar</button>
                                <button className="btn btn-sm btn-secondary"><Icon name="file-export" size={12} /> Exportar PDF</button>
                                <div style={{ flex: 1 }} />
                                <button className="icon-btn"><Icon name="thumb-up" size={14} /></button>
                                <button className="icon-btn"><Icon name="thumb-down" size={14} /></button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{ padding: '12px 28px 20px', background: 'var(--bg-base)', flexShrink: 0 }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-default)', borderRadius: 16, padding: 4, transition: 'border-color 150ms, box-shadow 150ms' }}>
              <textarea value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder="Pergunte algo, peça um resumo, gere conteúdo…"
                rows={2}
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--tx-1)', fontFamily: 'inherit', fontSize: 14, lineHeight: 1.5, padding: '14px 16px 8px', resize: 'none', minHeight: 48, maxHeight: 120 }}
              />
              <div style={{ display: 'flex', alignItems: 'center', padding: '4px 8px 8px', gap: 4 }}>
                <button className="icon-btn"><Icon name="paperclip" size={16} /></button>
                <button className="icon-btn"><Icon name="at" size={16} /></button>
                <button className="icon-btn"><Icon name="photo" size={16} /></button>
                <span style={{ flex: 1 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--tx-3)', marginRight: 8 }}>
                  <Icon name="cpu" size={12} /> Sonnet 4.6
                </div>
                <button onClick={send} className="btn btn-ai btn-sm" style={{ height: 32, padding: '0 14px' }}>
                  <Icon name="arrow-up" size={14} style={{ color: 'white' }} /> Enviar
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {quickActions.map(a => (
                <button key={a.l} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px', borderRadius: 99, border: '1px solid var(--bd-default)', background: 'var(--bg-surface)', color: 'var(--tx-2)', cursor: 'pointer', transition: 'all 120ms' }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--c-primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--tx-1)' }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--bd-default)'; (e.currentTarget as HTMLElement).style.color = 'var(--tx-2)' }}>
                  <Icon name={a.i} size={13} />{a.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

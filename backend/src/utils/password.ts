import bcrypt from 'bcryptjs'

const ROUNDS = 12

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) return { valid: false, message: 'Senha deve ter ao menos 8 caracteres' }
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Senha deve conter ao menos uma letra maiúscula' }
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Senha deve conter ao menos um número' }
  return { valid: true }
}

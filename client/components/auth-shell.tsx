'use client'

import Link from 'next/link'
import { Eye, EyeOff, Ruler } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiRequest, clearToken, getToken, saveToken, type User } from '@/lib/api'
import { useToast } from '@/components/toast-provider'

type AuthMode = 'login' | 'signup'

export function AuthShell({ mode }: { mode: AuthMode }) {
  const router = useRouter()
  const showToast = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isLogin = mode === 'login'

  useEffect(() => {
    if (getToken()) router.replace('/dashboard')
  }, [router])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const result = await apiRequest<{ token: string; user: User }>(`/auth/${isLogin ? 'login' : 'signup'}`, {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      })
      if (isLogin) {
        saveToken(result.token, rememberMe)
        showToast('Signed in successfully.')
        router.replace('/dashboard')
        router.refresh()
      } else {
        clearToken()
        showToast('User created successfully. Please sign in.')
        router.replace('/login')
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to connect. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-screen h-dvh overflow-hidden bg-[#f4f5f2] text-[#18211f]">
      <div className="grid h-full min-h-0 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden bg-[#173c35] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-[#d9f073] text-[#173c35]"><Ruler /></span>
              <span><strong className="block text-[15px] tracking-tight">Buildwise</strong><small className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#b8cbc0]">Cost intelligence</small></span>
            </Link>
            <div className="auth-pitch mt-16 max-w-md">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d9f073]">Plan with confidence</p>
              <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.055em]">Every project decision, in one clear view.</h1>
              <p className="mt-6 max-w-sm text-sm leading-7 text-[#b8cbc0]">Track materials, labor, and daily costs across every property you build.</p>
            </div>
          </div>
          <p className="text-xs text-[#91aaa0]">Built for contractors, builders, and property teams.</p>
        </section>

        <section className="auth-panel relative h-full min-h-0 overflow-hidden px-5 py-4 sm:px-10 sm:py-5 lg:px-12 xl:px-20">
          <div className="flex items-center justify-between">
            <span className="ml-auto text-xs text-[#8b9891]">{isLogin ? 'New to Buildwise?' : 'Already have an account?'}</span>
            <Link href={isLogin ? '/signup' : '/login'} className="ml-3 rounded-lg border border-[#dfe4df] px-3 py-2 text-xs font-bold text-[#355047]">{isLogin ? 'Create account' : 'Sign in'}</Link>
          </div>

          <div className="auth-content absolute left-1/2 top-1/2 flex w-[calc(100%-2.5rem)] max-w-[430px] -translate-x-1/2 -translate-y-1/2 flex-col justify-center py-3 sm:py-5">
            <div className="auth-brand mb-4 lg:hidden"><div className="mb-2 grid size-9 place-items-center rounded-xl bg-[#173c35] text-[#d9f073]"><Ruler /></div><p className="text-sm font-bold text-[#173c35]">Buildwise</p></div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#a08a50]">{isLogin ? 'Welcome back' : 'Get started'}</p>
            <h2 className="text-3xl font-semibold tracking-[-0.045em] text-[#173c35]">{isLogin ? 'Sign in to your workspace' : 'Create your Buildwise account'}</h2>
            <p className="auth-description mt-2 text-sm leading-6 text-[#7a8780]">{isLogin ? 'Access your estimates and keep every project moving.' : 'Start organizing project costs in one focused workspace.'}</p>

            <form className="auth-form mt-5 flex flex-col gap-3" onSubmit={handleSubmit}>
              {!isLogin && <label className="text-sm font-semibold text-[#34453d]">Full name<input required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-[#dfe4df] bg-[#fbfcfa] px-3.5 py-2.5 text-sm font-normal outline-none focus:border-[#71967f]" placeholder="Jordan Davis" /></label>}
              <label className="text-sm font-semibold text-[#34453d]">Email address<input required type="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[#dfe4df] bg-[#fbfcfa] px-3.5 py-2.5 text-sm font-normal outline-none focus:border-[#71967f]" placeholder="you@company.com" /></label>
              <label className="text-sm font-semibold text-[#34453d]">Password<div className="mt-2 flex items-center rounded-xl border border-[#dfe4df] bg-[#fbfcfa] focus-within:border-[#71967f]"><input required type={showPassword ? 'text' : 'password'} minLength={isLogin ? 1 : 8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-transparent px-3.5 py-2.5 text-sm font-normal outline-none" placeholder="••••••••" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="px-3 text-[#839089]">{showPassword ? <EyeOff /> : <Eye />}</button></div>{!isLogin && <span className="auth-helper mt-1 block text-xs font-normal text-[#8c9791]">Use at least 8 characters.</span>}</label>
              {isLogin && <label className="flex items-center gap-2 text-xs text-[#718078]"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="accent-[#173c35]" /> Remember me</label>}
              {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={isSubmitting} className="mt-1 rounded-xl bg-[#173c35] px-4 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">{isSubmitting ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}</button>
            </form>
            <p className="auth-legal mt-5 text-center text-xs leading-5 text-[#8b9891]">By continuing, you agree to Buildwise&apos;s terms and privacy policy.</p>
          </div>
        </section>
      </div>
    </main>
  )
}

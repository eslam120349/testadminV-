import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import CropMarks from '../../components/CropMarks.jsx'

export default function Login() {
    const navigate = useNavigate()

    const [form, setForm] = useState({
        email: '',
        password: '',
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        setError('')

        if (!form.email || !form.password) {
            setError('Please enter your email and password.')
            return
        }

        setLoading(true)

        const { data, error: loginError } =
            await supabase.auth.signInWithPassword({
                email: form.email.trim(),
                password: form.password,
            })

        setLoading(false)

        if (loginError) {
            setError('Invalid email or password.')
            return
        }

        // Check user role
        if (data?.user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single()

            if (profile?.role === 'admin') {
                navigate('/admin')
                return
            }
        }

        navigate('/')
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20">

            <div className="w-full max-w-md">

                <div className="cta-box reveal is-visible relative">

                    <CropMarks />

                    <div className="text-center mb-10">

                        <span className="eyebrow">
                            Welcome Back
                        </span>

                        <h1
                            className="cta-heading"
                            style={{
                                marginTop: 14,
                                fontSize: 'clamp(36px, 7vw, 56px)',
                            }}
                        >
                            WELCOME
                            <br />
                            BACK.
                        </h1>

                        <p className="text-mist mt-5">
                            Sign in to your Easy Group account.
                        </p>

                    </div>


                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-5"
                    >

                        {/* EMAIL */}

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm text-white/60 mb-2"
                            >
                                Email Address
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white outline-none transition focus:border-red-500/70"
                            />
                        </div>


                        {/* PASSWORD */}

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm text-white/60 mb-2"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white outline-none transition focus:border-red-500/70"
                            />
                        </div>


                        {/* ERROR */}

                        {error && (
                            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}


                        {/* SUBMIT */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-lg bg-red-500 text-white font-medium transition hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? 'Signing In...'
                                : 'Sign In'}
                        </button>

                    </form>


                    {/* REGISTER LINK */}

                    <div className="text-center mt-7">

                        <p className="text-sm text-white/50">
                            Don't have an account?{' '}

                            <Link
                                to="/register"
                                className="text-red-400 hover:text-red-300 transition"
                            >
                                Create one
                            </Link>
                        </p>

                    </div>

                </div>

            </div>

        </div>
    )
}

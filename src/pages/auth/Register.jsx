import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import CropMarks from '../../components/CropMarks.jsx'

export default function Register() {
    const navigate = useNavigate()

    const [form, setForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        setError('')
        setSuccess('')

        if (!form.email || !form.password || !form.confirmPassword) {
            setError('Please fill in all fields.')
            return
        }

        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        setLoading(true)

        const { data, error: signUpError } =
            await supabase.auth.signUp({
                email: form.email.trim(),
                password: form.password,
            })

        setLoading(false)

        if (signUpError) {
            setError(signUpError.message)
            return
        }

        // If email confirmation is disabled
        if (data?.session) {
            navigate('/')
            return
        }

        // If email confirmation is enabled
        setSuccess(
            'Account created successfully. Please check your email to confirm your account.'
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20">

            <div className="w-full max-w-md">

                <div className="cta-box reveal is-visible relative">

                    <CropMarks />

                    <div className="text-center mb-10">

                        <span className="eyebrow">
                            Join Us
                        </span>

                        <h1
                            className="cta-heading"
                            style={{
                                marginTop: 14,
                                fontSize: 'clamp(36px, 7vw, 56px)',
                            }}
                        >
                            CREATE
                            <br />
                            ACCOUNT.
                        </h1>

                        <p className="text-mist mt-5">
                            Create your account and get started.
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
                                autoComplete="new-password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white outline-none transition focus:border-red-500/70"
                            />
                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm text-white/60 mb-2"
                            >
                                Confirm Password
                            </label>

                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                value={form.confirmPassword}
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


                        {/* SUCCESS */}

                        {success && (
                            <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                                {success}
                            </div>
                        )}


                        {/* SUBMIT */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-lg bg-red-500 text-white font-medium transition hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? 'Creating Account...'
                                : 'Create Account'}
                        </button>

                    </form>


                    {/* LOGIN LINK */}

                    <div className="text-center mt-7">

                        <p className="text-sm text-white/50">
                            Already have an account?{' '}

                            <Link
                                to="/login"
                                className="text-red-400 hover:text-red-300 transition"
                            >
                                Sign in
                            </Link>
                        </p>

                    </div>

                </div>

            </div>

        </div>
    )
}

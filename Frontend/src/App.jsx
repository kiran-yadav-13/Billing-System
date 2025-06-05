import { useState } from 'react'
import './App.css'
import './index.css'

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(`Email: ${email}\nPassword: ${password}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-purple-50 to-purple-100 px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 space-y-8">
        <h1 className="text-3xl font-extrabold text-center text-purple-800">
          Welcome to TAC Services Pvt. Ltd
        </h1>
        <h2 className="text-xl font-semibold text-center text-purple-600">
          Login 
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-purple-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-purple-300 rounded-lg p-3 focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
            />
          </div>

          <div>
            <label className="block text-purple-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-purple-300 rounded-lg p-3 focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition"
          >
            Login
          </button>

          <div className="text-center">
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Forgot Password?
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

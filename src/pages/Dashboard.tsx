import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Info, Users, Package, MessageSquare, CheckCircle } from 'lucide-react'

export default function Dashboard() {
  const [greetMsg, setGreetMsg] = useState('')
  const [name, setName] = useState('')

  async function greet() {
    setGreetMsg(await invoke('greet', { name }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-base-content">Dashboard</h1>
        <p className="text-base-content/70 mt-2">
          Welcome to your Tauri + React application
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-primary">
            <Info className="w-8 h-8" />
          </div>
          <div className="stat-title">Total Views</div>
          <div className="stat-value text-primary">89.4K</div>
          <div className="stat-desc">21% more than last month</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-secondary">
            <Users className="w-8 h-8" />
          </div>
          <div className="stat-title">New Users</div>
          <div className="stat-value text-secondary">4,200</div>
          <div className="stat-desc">↗︎ 400 (22%)</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-figure text-accent">
            <Package className="w-8 h-8" />
          </div>
          <div className="stat-title">New Registers</div>
          <div className="stat-value text-accent">1,200</div>
          <div className="stat-desc">↘︎ 90 (14%)</div>
        </div>
      </div>

      {/* Greeting Card */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">
            <MessageSquare className="w-6 h-6 text-primary" />
            Try the Greeting Feature
          </h2>
          <p className="text-base-content/70">
            Test the Rust backend integration by sending a greeting message
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              void greet()
            }}
            className="flex gap-2 mt-4"
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder="Enter your name..."
              className="input input-bordered flex-1"
            />
            <button type="submit" className="btn btn-primary">
              Send Greeting
            </button>
          </form>

          {greetMsg && (
            <div className="alert alert-success mt-4">
              <CheckCircle className="w-6 h-6" />
              <span>{greetMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content">
          <div className="card-body">
            <h2 className="card-title">Quick Action 1</h2>
            <p>Perform your most common task with a single click</p>
            <div className="card-actions justify-end">
              <button className="btn btn-ghost">Action</button>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-accent to-info text-accent-content">
          <div className="card-body">
            <h2 className="card-title">Quick Action 2</h2>
            <p>Access important features directly from here</p>
            <div className="card-actions justify-end">
              <button className="btn btn-ghost">Action</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

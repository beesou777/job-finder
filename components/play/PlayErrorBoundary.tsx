"use client";
// KamKhoj Play — error isolation: a crash in one game never kills Play.

import React from "react";

interface State {
  failed: boolean;
  message: string;
}

export class PlayErrorBoundary extends React.Component<{ children: React.ReactNode; name?: string }, State> {
  constructor(props: { children: React.ReactNode; name?: string }) {
    super(props);
    this.state = { failed: false, message: "" };
  }

  static getDerivedStateFromError(err: unknown): State {
    return { failed: true, message: err instanceof Error ? err.message : "Something went wrong." };
  }

  componentDidCatch(): void {
    // intentionally local-only; no reporting backend
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="mx-auto max-w-md rounded-2xl border border-red-100 bg-red-50/60 p-6 text-center">
          <p className="text-base font-black text-red-900">This game hit a snag</p>
          <p className="mt-1 text-sm text-red-700/80">{this.state.message || "An unexpected error interrupted play."}</p>
          <p className="mt-1 text-xs text-red-700/60">Your other Play progress is safe.</p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => this.setState({ failed: false, message: "" })}
              className="rounded-xl bg-red-700 px-5 py-2.5 text-sm font-black text-white hover:bg-red-800"
            >
              Try again
            </button>
            <a href="/play" className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-bold text-red-800">
              All games
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

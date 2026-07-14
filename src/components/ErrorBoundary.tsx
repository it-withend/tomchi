import { Component, type ReactNode } from 'react';

// Last-resort guard: a render crash shows a friendly bilingual reload screen
// instead of a blank page (farmers won't open devtools).
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Tomchi crash:', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="grid min-h-dvh place-items-center bg-wash px-6 text-center">
        <div>
          <img src="/tomchi.png" alt="" className="mx-auto h-14 w-14 rounded-2xl" />
          <p className="mt-4 font-display text-lg font-bold text-water-deep">Nimadir xato ketdi · Что-то пошло не так</p>
          <p className="mt-1 text-sm text-ink/60">Sahifani yangilang · Обновите страницу</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-water px-6 py-3 text-sm font-semibold text-white">
            Yangilash · Обновить
          </button>
        </div>
      </div>
    );
  }
}

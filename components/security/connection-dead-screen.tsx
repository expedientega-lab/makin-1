'use client'

import { useEffect, useState } from 'react'

export function ConnectionDeadScreen() {
  const [host, setHost] = useState('este sitio')

  useEffect(() => {
    setHost(window.location.hostname || 'este sitio')

    const killFetch = window.fetch.bind(window)
    window.fetch = () => Promise.reject(new TypeError('Failed to fetch'))

    if (typeof XMLHttpRequest !== 'undefined') {
      const Proto = XMLHttpRequest.prototype
      Proto.open = function () {
        return
      }
      Proto.send = function () {
        return
      }
    }

    try {
      window.stop()
    } catch {
      // ignore
    }

    const blockAll = (e: Event) => {
      e.preventDefault()
      e.stopImmediatePropagation()
    }
    const events = [
      'click',
      'keydown',
      'keyup',
      'contextmenu',
      'mousedown',
      'mouseup',
      'touchstart',
      'touchend',
      'wheel',
      'scroll',
    ] as const
    for (const name of events) {
      document.addEventListener(name, blockAll, true)
    }

    return () => {
      window.fetch = killFetch
      for (const name of events) {
        document.removeEventListener(name, blockAll, true)
      }
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col bg-[#202124] text-[#e8eaed]"
      style={{ fontFamily: 'Segoe UI, system-ui, sans-serif' }}
    >
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
        <div
          className="mb-6 h-[72px] w-[72px] opacity-90"
          style={{
            background:
              'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 48 48\'%3E%3Cpath fill=\'%239aa0a6\' d=\'M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm-2 12h4v14h-4V16zm2 18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z\'/%3E%3C/svg%3E") center/contain no-repeat',
          }}
          aria-hidden
        />

        <h1 className="mb-3 text-center text-[22px] font-normal text-[#e8eaed] sm:text-[28px]">
          No se puede acceder a este sitio web
        </h1>

        <p className="mb-6 max-w-xl text-center text-[14px] text-[#9aa0a6] sm:text-[15px]">
          <span className="text-[#bdc1c6]">{host}</span> ha tardado demasiado tiempo en
          responder.
        </p>

        <div className="max-w-md text-[13px] leading-relaxed text-[#9aa0a6]">
          <p className="mb-2 font-medium text-[#bdc1c6]">Prueba a:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Comprobar la conexión</li>
            <li>
              <span className="text-[#8ab4f8]">Comprobar el proxy y el cortafuegos</span>
            </li>
            <li>
              <span className="text-[#8ab4f8]">Ejecutar Diagnósticos de red de Windows</span>
            </li>
          </ul>
        </div>

        <p className="mt-8 text-[12px] tracking-wide text-[#9aa0a6]">ERR_CONNECTION_TIMED_OUT</p>
      </div>
    </div>
  )
}

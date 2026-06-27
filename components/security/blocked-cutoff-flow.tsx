'use client'

import { useEffect } from 'react'
import { ConnectionDeadScreen } from './connection-dead-screen'

const SS_CUTOFF_DONE = 'mk_cutoff_complete'

interface BlockedCutoffFlowProps {
  ip: string
}

/** Flujo silencioso: sin pantalla de advertencia, directo a conexión caída. */
export function BlockedCutoffFlow({ ip: _ip }: BlockedCutoffFlowProps) {
  useEffect(() => {
    const activateCutoff = async () => {
      try {
        await fetch('/api/security/cutoff', {
          method: 'POST',
          credentials: 'include',
        })
      } catch {
        // ignore
      }
      sessionStorage.setItem(SS_CUTOFF_DONE, '1')
    }

    void activateCutoff()
  }, [])

  return <ConnectionDeadScreen />
}

import { useEffect, useRef, useState } from 'react'

type Props = {
  onDetect: (barcode: string) => void
  onClose: () => void
}

function supportsNative(): boolean {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window
}

export function Scanner({ onDetect, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onDetectRef = useRef(onDetect)
  onDetectRef.current = onDetect
  const [manual, setManual] = useState('')
  const [error, setError] = useState('')
  const detected = useRef(false)

  useEffect(() => {
    detected.current = false
    let stop: (() => void) | undefined
    let cancelled = false

    const handle = (code: string) => {
      const cleaned = code.replace(/\s/g, '')
      if (!cleaned || detected.current) return
      detected.current = true
      onDetectRef.current(cleaned)
    }

    async function startNative() {
      const video = videoRef.current
      if (!video) return
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      video.srcObject = stream
      await video.play()
      const detector = new BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'],
      })
      let raf = 0
      const tick = async () => {
        if (cancelled || detected.current) return
        try {
          const codes = await detector.detect(video)
          const value = codes[0]?.rawValue
          if (value) {
            handle(value)
            return
          }
        } catch {
          /* frame skipped */
        }
        raf = requestAnimationFrame(() => {
          void tick()
        })
      }
      void tick()
      stop = () => {
        cancelAnimationFrame(raf)
        stream.getTracks().forEach((t) => t.stop())
        video.srcObject = null
      }
    }

    async function startHtml5() {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode')
      const scanner = new Html5Qrcode('scanner-region', {
        verbose: false,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
        ],
      })
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 8,
          qrbox: { width: 280, height: 140 },
        },
        (text) => handle(text),
        () => undefined,
      )
      stop = () => {
        void scanner.stop().then(() => scanner.clear()).catch(() => undefined)
      }
    }

    ;(async () => {
      try {
        if (supportsNative()) await startNative()
        else await startHtml5()
      } catch {
        if (cancelled) return
        try {
          await startHtml5()
        } catch {
          if (!cancelled) setError('Kamera nicht verfügbar. Code unten eintippen.')
        }
      }
    })()

    return () => {
      cancelled = true
      stop?.()
    }
  }, [])

  return (
    <div className="overlay scanner-overlay">
      <header className="overlay-bar">
        <button type="button" className="text-btn" onClick={onClose}>
          Abbrechen
        </button>
        <h2>Scannen</h2>
        <span className="spacer" />
      </header>
      <div className="scanner-stage">
        {supportsNative() ? <video ref={videoRef} className="scanner-video" playsInline muted /> : null}
        <div id="scanner-region" className={supportsNative() ? 'scanner-hidden' : 'scanner-box'} />
        <div className="scanner-guide" />
      </div>
      {error ? <p className="hint warn">{error}</p> : <p className="hint">Barcode in den Rahmen halten</p>}
      <form
        className="manual-barcode"
        onSubmit={(e) => {
          e.preventDefault()
          const code = manual.trim()
          if (code) onDetect(code)
        }}
      >
        <input
          inputMode="numeric"
          autoComplete="off"
          placeholder="Code eintippen"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
        />
        <button type="submit" className="btn" disabled={!manual.trim()}>
          OK
        </button>
      </form>
    </div>
  )
}

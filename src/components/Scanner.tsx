import { useEffect, useRef, useState } from 'react'

type Props = {
  onDetect: (barcode: string) => void
  onClose: () => void
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

    async function startPreviewAndDetect() {
      const video = videoRef.current
      if (!video) throw new Error('no video')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      video.srcObject = stream
      video.muted = true
      video.playsInline = true
      video.setAttribute('playsinline', 'true')
      await video.play()

      if ('BarcodeDetector' in window) {
        const detector = new BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'],
        })
        let raf = 0
        const tick = async () => {
          if (cancelled || detected.current) return
          try {
            if (video.readyState >= 2) {
              const codes = await detector.detect(video)
              const value = codes[0]?.rawValue
              if (value) {
                handle(value)
                return
              }
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
        return
      }

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
      stream.getTracks().forEach((t) => t.stop())
      video.srcObject = null
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (w, h) => ({
            width: Math.floor(Math.min(w * 0.86, 340)),
            height: Math.floor(Math.min(h * 0.28, 150)),
          }),
        },
        (text) => handle(text),
        () => undefined,
      )
      stop = () => {
        void scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => undefined)
      }
    }

    void startPreviewAndDetect().catch(() => {
      if (!cancelled) setError('Kamera nicht verfügbar. Code unten eintippen.')
    })

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
        <video ref={videoRef} className="scanner-video" autoPlay muted playsInline />
        <div id="scanner-region" className="scanner-box" />
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

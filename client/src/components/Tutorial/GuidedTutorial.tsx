import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUp, ArrowDown, Volume2, Sparkles, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { Button } from '@librechat/client';

const TUTORIAL_KEY = 'vaka_llm_tutorial_v1';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function GuidedTutorial() {
  const [step, setStep] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);

  // Check initial trigger
  useEffect(() => {
    const isCompleted = localStorage.getItem(TUTORIAL_KEY);
    if (!isCompleted) {
      const timer = setTimeout(() => setStep(1), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Update target rect on step change or window resize
  const updateRect = useCallback(() => {
    if (step === 0) {
      setTargetRect(null);
      return;
    }

    let targetEl: HTMLElement | null = null;
    if (step === 1) {
      targetEl =
        document.querySelector('[data-testid="model-selector-button"]') ||
        document.querySelector('button[aria-label*="modelo"]') ||
        document.querySelector('button[aria-label*="model"]');
    } else if (step === 2) {
      targetEl =
        document.getElementById('vaka-prompt-textarea') ||
        document.querySelector('textarea') ||
        document.querySelector('[data-testid="text-area-header"]');
    } else if (step === 3) {
      targetEl =
        document.querySelector('[aria-label*="Escuchar"]') ||
        document.querySelector('[aria-label*="Play"]') ||
        document.querySelector('.hover-button-audio') ||
        document.querySelector('#vaka-prompt-textarea');
    }

    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setTargetRect(null);
    }
  }, [step]);

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [updateRect, step]);

  const completeTutorial = () => {
    localStorage.setItem(TUTORIAL_KEY, 'completed');
    setStep(0);
  };

  const nextStep = () => {
    if (step >= 3) {
      completeTutorial();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  if (step === 0) {
    return null;
  }

  // Calculate card position
  let cardTop = '50%';
  let cardLeft = '50%';
  let transform = 'translate(-50%, -50%)';
  let arrowDirection: 'up' | 'down' | 'none' = 'none';

  if (targetRect) {
    if (step === 1) {
      // Below model selector in top header
      cardTop = `${Math.min(window.innerHeight - 300, targetRect.top + targetRect.height + 24)}px`;
      cardLeft = `${Math.max(20, Math.min(window.innerWidth - 380, targetRect.left - 40))}px`;
      transform = 'none';
      arrowDirection = 'up';
    } else if (step === 2) {
      // Above prompt input at bottom
      cardTop = `${Math.max(20, targetRect.top - 240)}px`;
      cardLeft = `${Math.max(20, Math.min(window.innerWidth - 380, targetRect.left + (targetRect.width / 2) - 180))}px`;
      transform = 'none';
      arrowDirection = 'down';
    } else if (step === 3) {
      // Center or near audio hint
      cardTop = `${Math.max(40, targetRect.top - 240)}px`;
      cardLeft = `${Math.max(20, Math.min(window.innerWidth - 380, targetRect.left - 60))}px`;
      transform = 'none';
      arrowDirection = 'down';
    }
  }

  return (
    <>
      {/* Dark Overlay */}
      <div
        className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-[2px] transition-all duration-300"
        onClick={completeTutorial}
      />

      {/* Target Spotlight Highlight */}
      {targetRect && (
        <div
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
          className="fixed z-[101] pointer-events-none rounded-xl border-2 border-primary ring-4 ring-primary/60 shadow-[0_0_30px_rgba(59,130,246,0.8)] transition-all duration-300 animate-pulse"
        />
      )}

      {/* Floating Tutorial Card with Glassmorphism Translucency */}
      <div
        style={{
          top: cardTop,
          left: cardLeft,
          transform: transform,
        }}
        className="fixed z-[102] w-[92vw] max-w-[360px] rounded-2xl border border-border-medium/60 bg-surface-primary/75 backdrop-blur-md p-5 shadow-[0_10px_35px_rgba(0,0,0,0.5)] transition-all duration-300 text-text-primary"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-light pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary font-bold text-xs">
              🎮
            </div>
            <span className="font-bold text-sm tracking-wide text-text-primary">
              TUTORIAL VaKA LLM
            </span>
          </div>
          <button
            onClick={completeTutorial}
            className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-md"
            title="Saltar Tutorial"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Step Badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
            <Sparkles className="size-3" /> Paso {step} de 3
          </span>
          <span className="text-xs text-text-tertiary">100% Interactivo</span>
        </div>

        {/* Arrow Animation */}
        {arrowDirection === 'up' && (
          <div className="flex justify-center -mt-1 mb-2 animate-bounce text-primary">
            <ArrowUp className="size-6 stroke-[3]" />
          </div>
        )}

        {/* Content Details */}
        {step === 1 && (
          <div className="space-y-2">
            <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
              🧠 Elegir tu Modelo AI
            </h3>
            <p className="text-xs leading-relaxed text-text-secondary">
              ¡Bienvenido a VaKA LLM! En la barra superior puedes seleccionar el cerebro de Inteligencia Artificial que deseas usar: <strong>Gemini 2.0 Flash</strong>, <strong>Groq Llama 3.3</strong>, <strong>Mistral</strong> o modelos gratuitos de <strong>OpenRouter</strong>.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
              ✍️ Escribir Consultas y Prompts
            </h3>
            <p className="text-xs leading-relaxed text-text-secondary">
              En esta caja de texto puedes escribir lo que quieras: pedir redactar documentos, resolver código, realizar análisis o adjuntar archivos. VaKA LLM te responderá de inmediato.
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2">
            <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
              🔊 Voz Inteligente TTS (Sin Símbolos)
            </h3>
            <p className="text-xs leading-relaxed text-text-secondary">
              VaKA LLM incluye voz automática avanzada que omite emojis, barras e iconos molestos al leer. Haz clic en el botón de reproducción de voz en cualquier mensaje para escucharlo en audio fluido.
            </p>
          </div>
        )}

        {arrowDirection === 'down' && (
          <div className="flex justify-center mt-2 -mb-1 animate-bounce text-primary">
            <ArrowDown className="size-6 stroke-[3]" />
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-4 mt-3 border-t border-border-light">
          <button
            onClick={completeTutorial}
            className="text-xs text-text-tertiary hover:underline"
          >
            Saltar todo
          </button>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                className="text-xs px-3 py-1 h-8 rounded-lg"
              >
                Anterior
              </Button>
            )}
            <Button
              variant="submit"
              size="sm"
              onClick={nextStep}
              className="text-xs px-3.5 py-1 h-8 rounded-lg font-semibold gap-1"
            >
              {step === 3 ? (
                <>
                  <CheckCircle2 className="size-3.5" /> ¡Empezar!
                </>
              ) : (
                <>
                  Siguiente <ChevronRight className="size-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

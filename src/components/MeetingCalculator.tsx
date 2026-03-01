"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import InputForm from "./InputForm";
import Ticker from "./Ticker";
import SessionPanel from "./SessionPanel";
import ShareReport from "./ShareReport";
import { useMeetingSessions } from "@/hooks/useMeetingSessions";
import type { MeetingSession } from "@/hooks/useMeetingSessions";

export interface Attendee {
  id: string;
  name: string;
  hourlyRate: number;
  currency: string;
  joinedAtSeconds: number;
}

export default function MeetingCalculator() {
  const t = useTranslations();

  // Saved/committed attendees
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  // Draft attendee = person currently being typed in form
  const [draftAttendee, setDraftAttendee] = useState<Attendee | null>(null);
  // Key to force InputForm remount (clears form fields)
  const [inputFormKey, setInputFormKey] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Session management
  const { sessions, saveSession, deleteSession } = useMeetingSessions();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState("");
  const [initialElapsed, setInitialElapsed] = useState<number | undefined>(undefined);
  const [tickerKey, setTickerKey] = useState(0);

  const currentElapsedRef = useRef(0);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleElapsedUpdate = useCallback((seconds: number) => {
    currentElapsedRef.current = seconds;
  }, []);

  const getCurrentElapsed = useCallback(() => {
    return currentElapsedRef.current;
  }, []);

  // Effective attendees = saved + draft (if complete)
  const effectiveAttendees = useMemo(() => {
    return draftAttendee ? [...attendees, draftAttendee] : attendees;
  }, [attendees, draftAttendee]);

  const canStart = effectiveAttendees.length > 0;

  // Compute cost snapshot for saving
  const getCostSnapshot = useCallback((): Record<string, number> => {
    const snapshot: Record<string, number> = {};
    for (const a of attendees) {
      const personElapsed = Math.max(0, currentElapsedRef.current - a.joinedAtSeconds);
      const cost = (a.hourlyRate / 3600) * personElapsed;
      snapshot[a.currency] = (snapshot[a.currency] || 0) + cost;
    }
    return snapshot;
  }, [attendees]);

  // Auto-save current session periodically when running or paused
  const doAutoSave = useCallback(() => {
    if (!hasStarted || attendees.length === 0) return;

    const status: MeetingSession["status"] = isRunning ? "running" : isPaused ? "paused" : "stopped";
    const name = sessionName.trim() || t("sessions.untitled_meeting");

    const newId = saveSession({
      id: currentSessionId || undefined,
      name,
      attendees,
      elapsedSeconds: Math.floor(currentElapsedRef.current),
      status,
      totalCostSnapshot: getCostSnapshot(),
    });

    if (!currentSessionId) {
      setCurrentSessionId(newId);
    }
  }, [hasStarted, attendees, isRunning, isPaused, sessionName, currentSessionId, saveSession, getCostSnapshot, t]);

  // Auto-save every 5 seconds when running
  useEffect(() => {
    if (isRunning) {
      autoSaveTimerRef.current = setInterval(doAutoSave, 5000);
      return () => {
        if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
      };
    } else {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    }
  }, [isRunning, doAutoSave]);

  // Save on pause/stop
  useEffect(() => {
    if (hasStarted && (isPaused || (!isRunning && !isPaused))) {
      doAutoSave();
    }
  }, [isPaused, isRunning, hasStarted, doAutoSave]);

  const handleStart = useCallback(() => {
    if (effectiveAttendees.length === 0) return;

    // Auto-commit draft if exists, then reset all joinedAtSeconds
    const startingAttendees = draftAttendee
      ? [...attendees, draftAttendee]
      : attendees;
    setAttendees(
      startingAttendees.map((a) => ({ ...a, joinedAtSeconds: 0 }))
    );

    if (draftAttendee) {
      setDraftAttendee(null);
      setInputFormKey((k) => k + 1); // clear form
    }

    setIsRunning(true);
    setIsPaused(false);
    setHasStarted(true);
    setInitialElapsed(undefined);
  }, [effectiveAttendees.length, draftAttendee, attendees]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setHasStarted(false);
    currentElapsedRef.current = 0;
    setCurrentSessionId(null);
    setSessionName("");
    setInitialElapsed(undefined);
  }, []);

  // Load a saved session
  const handleLoadSession = useCallback((session: MeetingSession) => {
    // Stop current if running
    setIsRunning(false);
    setIsPaused(false);

    // Restore state
    setAttendees(session.attendees);
    setCurrentSessionId(session.id);
    setSessionName(session.name);
    setHasStarted(true);
    setInputFormKey((k) => k + 1);
    setDraftAttendee(null);

    // Restore elapsed time
    currentElapsedRef.current = session.elapsedSeconds;
    setInitialElapsed(session.elapsedSeconds);
    setTickerKey((k) => k + 1);

    // Set appropriate state
    if (session.status === "paused") {
      setIsPaused(true);
    } else if (session.status === "stopped") {
      // stays stopped
    }
    // Don't auto-resume running sessions — user can press resume
    if (session.status === "running") {
      setIsPaused(true); // load as paused, user clicks resume
    }
  }, []);

  const handleNewSession = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setHasStarted(false);
    setAttendees([]);
    setDraftAttendee(null);
    setCurrentSessionId(null);
    setSessionName("");
    setInitialElapsed(undefined);
    currentElapsedRef.current = 0;
    setInputFormKey((k) => k + 1);
    setTickerKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-8">
      {/* Session bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <SessionPanel
          sessions={sessions}
          currentSessionId={currentSessionId}
          onLoadSession={handleLoadSession}
          onDeleteSession={deleteSession}
          onNewSession={handleNewSession}
        />
        {hasStarted && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder={t("sessions.session_name_placeholder")}
              className="flex-1 min-w-0 px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
            />
            {currentSessionId && (
              <span className="text-[10px] text-gray-600 whitespace-nowrap">
                {t("sessions.auto_saved")}
              </span>
            )}
          </div>
        )}
      </div>

      <InputForm
        key={inputFormKey}
        attendees={attendees}
        setAttendees={setAttendees}
        hasStarted={hasStarted}
        getCurrentElapsed={getCurrentElapsed}
        onDraftChange={setDraftAttendee}
      />

      <Ticker
        key={`${tickerKey}-${hasStarted ? 1 : 0}`}
        attendees={effectiveAttendees}
        isRunning={isRunning}
        hasStarted={hasStarted}
        onElapsedUpdate={handleElapsedUpdate}
        initialElapsed={initialElapsed}
      />

      {/* Controls */}
      <div className="flex justify-center gap-3 flex-wrap">
        {!hasStarted ? (
          <button
            onClick={handleStart}
            disabled={!canStart}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
          >
            {t("form.start_button")}
          </button>
        ) : isRunning ? (
          <>
            <button
              onClick={handlePause}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
            >
              {t("form.pause_button")}
            </button>
            <button
              onClick={handleStop}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
            >
              {t("form.stop_button")}
            </button>
          </>
        ) : isPaused ? (
          <>
            <button
              onClick={handleResume}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            >
              {t("form.resume_button")}
            </button>
            <button
              onClick={handleStop}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
            >
              {t("form.stop_button")}
            </button>
          </>
        ) : (
          <button
            onClick={handleReset}
            className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-white font-bold text-lg rounded-xl transition-all shadow-lg"
          >
            {t("form.reset_button")}
          </button>
        )}
      </div>

      {/* Share Report — visible when stopped or paused with data */}
      <ShareReport
        attendees={attendees}
        elapsedSeconds={Math.floor(currentElapsedRef.current)}
        isVisible={hasStarted && !isRunning}
      />
    </div>
  );
}

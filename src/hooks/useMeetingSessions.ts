"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Attendee } from "@/components/MeetingCalculator";

const STORAGE_KEY = "meetingcost_sessions";
const MAX_SESSIONS = 20;

export interface MeetingSession {
  id: string;
  name: string;
  attendees: Attendee[];
  elapsedSeconds: number;
  status: "running" | "paused" | "stopped";
  createdAt: string;
  updatedAt: string;
  totalCostSnapshot: Record<string, number>; // currency -> amount at time of save
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadSessions(): MeetingSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: MeetingSession[]): void {
  if (typeof window === "undefined") return;
  try {
    // Keep only newest MAX_SESSIONS
    const trimmed = sessions.slice(0, MAX_SESSIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full or unavailable – silently ignore
  }
}

export function useMeetingSessions() {
  const [sessions, setSessions] = useState<MeetingSession[]>(() => loadSessions());
  const skipFirstPersistRef = useRef(true);

  // Persist whenever sessions change (skip initial mount)
  useEffect(() => {
    if (skipFirstPersistRef.current) {
      skipFirstPersistRef.current = false;
      return;
    }
    saveSessions(sessions);
  }, [sessions]);

  const saveSession = useCallback(
    (data: {
      id?: string;
      name: string;
      attendees: Attendee[];
      elapsedSeconds: number;
      status: MeetingSession["status"];
      totalCostSnapshot: Record<string, number>;
    }): string => {
      const now = new Date().toISOString();

      if (data.id) {
        const id = data.id;
        // Update existing and move to front
        setSessions((prev) => {
          const existing = prev.find((s) => s.id === id);
          const updated: MeetingSession = {
            ...(existing ?? {
              id,
              createdAt: now,
              updatedAt: now,
              name: data.name,
              attendees: data.attendees,
              elapsedSeconds: data.elapsedSeconds,
              status: data.status,
              totalCostSnapshot: data.totalCostSnapshot,
            }),
            name: data.name,
            attendees: data.attendees,
            elapsedSeconds: data.elapsedSeconds,
            status: data.status,
            totalCostSnapshot: data.totalCostSnapshot,
            updatedAt: now,
          };

          const without = prev.filter((s) => s.id !== id);
          return [updated, ...without];
        });
        return data.id;
      } else {
        // Create new
        const newId = generateId();
        const session: MeetingSession = {
          id: newId,
          name: data.name,
          attendees: data.attendees,
          elapsedSeconds: data.elapsedSeconds,
          status: data.status,
          totalCostSnapshot: data.totalCostSnapshot,
          createdAt: now,
          updatedAt: now,
        };
        setSessions((prev) => [session, ...prev]);
        return newId;
      }
    },
    []
  );

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const getSession = useCallback(
    (id: string): MeetingSession | undefined => {
      return sessions.find((s) => s.id === id);
    },
    [sessions]
  );

  return {
    sessions,
    saveSession,
    deleteSession,
    getSession,
  };
}

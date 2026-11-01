"use client";

import { useEffect } from 'react';
import { homeFor, session } from "@/lib/api";

export default function Home() {
  useEffect(() => {
    const user = session.user;
    window.location.href = session.token && user ? homeFor(user.role) : "/login";
  }, []);
  return null;
}

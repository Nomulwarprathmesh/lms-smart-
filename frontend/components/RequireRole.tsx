"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Role, homeFor, session } from "@/lib/api";

export default function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const user = session.user;
    if (!session.token || !user) router.replace("/login");
    else if (user.role !== role) router.replace(homeFor(user.role));
    else setOk(true);
  }, [role, router]);

  return ok ? <>{children}</> : null;
}

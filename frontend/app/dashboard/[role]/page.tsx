import { redirect } from "next/navigation";

export default function DashboardRedirect({ params }: { params: { role: string } }) {
  const role = params.role.toLowerCase();
  if (["admin", "hod", "teacher", "student"].includes(role)) redirect(`/${role}`);
  redirect("/login");
}

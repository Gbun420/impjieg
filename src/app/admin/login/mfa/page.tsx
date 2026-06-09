import { redirect } from "next/navigation";
import { readAdminMfaChallengeCookie, buildAdminOtpAuthUri } from "@/lib/admin-mfa";
import { hasValidAdminSession } from "@/lib/admin-session";
import { generateQrCodeSvg, formatSecretForDisplay } from "@/lib/qr-code";
import AdminMfaForm from "./admin-mfa-form";

export default async function AdminMfaPage() {
  if (await hasValidAdminSession()) {
    redirect("/admin/dashboard");
  }

  const challenge = await readAdminMfaChallengeCookie();

  if (!challenge) {
    redirect("/admin/login");
  }

  const qrCodeSvg = challenge.mode === "setup" && challenge.secret
    ? await generateQrCodeSvg(buildAdminOtpAuthUri({ email: challenge.email, secret: challenge.secret }))
    : undefined;

  const formattedSecret = challenge.mode === "setup" && challenge.secret
    ? formatSecretForDisplay(challenge.secret)
    : undefined;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center px-4 py-10">
      <AdminMfaForm 
        mode={challenge.mode} 
        email={challenge.email} 
        qrCodeSvg={qrCodeSvg}
        formattedSecret={formattedSecret}
      />
    </div>
  );
}

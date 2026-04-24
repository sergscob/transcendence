import Button from "@/components/ui_int/Button"
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useTranslation } from "react-i18next";



export default function QrcodeDialog({ open, setOpen, qrcode, onSuccess }) {
  const { t } = useTranslation();
  const [code, setcode] = useState("");
  const [error, setError] = useState("");
  const [okEnabled, setOkEnabled] = useState(false);
  
  useEffect(() => {
     setOkEnabled(code.length === 6);
     setError(""); 
  }, [code]);

  async function OnClickOk() {
    const error = onSuccess(code);
    if (error)
      setError(error);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="_sm:max-w-md bg-white border-0 shadow-2xl ring-0 w-150">
		<DialogDescription />
        <DialogTitle/>
        {qrcode && (
          <>
            <h2 className="text-lg font-semibold text-center">
                {t("otp_dialog.scan_qr")}
            </h2>
            <div className="flex items-center">
                <img src={`data:image/png;base64,${qrcode}`} />
            </div>
          </>
        )}
        <h2 className="text-lg font-semibold text-center">
          {t("otp_dialog.open_authenticator_enter_code")}
        </h2>
        <div className="flex items-center justify-center">
            <InputOTP maxLength={6} defaultValue="" onChange={(value) => setcode(value)} >
                <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                </InputOTPGroup>
            </InputOTP>
        </div>
        <div className="error-message text-center mt-2">
            {error}
        </div>
       
        <DialogFooter className="sm:justify-start">
            <Button disabled={!okEnabled} type="button" onClick={() => OnClickOk()}>
               {t("otp_dialog.ok")}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

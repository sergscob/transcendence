import Button from "@/components/ui_int/Button"
import API from "@/api/api";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"



export default function QrcodeDialog({ open, setOpen, qrcode, onSuccess }) {
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
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl ring-0">
        <DialogTitle/ >
        {qrcode && (
          <>
            <h2 className="text-lg font-semibold text-center">
                Scan QR Code by Google Authenticator
            </h2>
            <div className="flex items-center">
                <img src={`data:image/png;base64,${qrcode}`} />
            </div>
          </>
        )}
        <h2 className="text-lg font-semibold text-center">
          Open Google Authenticator and enter the code: 
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
               OK
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import Button from "@/components/ui_int/Button"
import Input from "@/components/ui_int/Input"
import API from "@/api/api";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { useTranslation } from "react-i18next";


export default function CreateMatch({ open, setOpen, onSuccess }) {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [okEnabled, setOkEnabled] = useState(false);
  
  useEffect(() => {
     setOkEnabled(true);
     setError(""); 
  }, [open]);

  async function OnClickOk() {
    try {
        await API.post("matches/", {
            players_maxcount: 2,
            time_limit: 5
        })
    } catch (err) {
        setError(err.response.data.detail || t("matches.create_match_error"));
        return;
    }
    const error = onSuccess();
    if (error)
      setError(error);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl ring-0">
        <DialogTitle/ >
        <h2 className="text-lg font-semibold text-center">
          {t("matches.create_match")}
        </h2>
        <div className="">
            <Input placeholder={t("matches.players_maxcount")} className="w-full mt-4" />
            <Input placeholder={t("matches.time_limit")} className="w-full mt-4" />
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

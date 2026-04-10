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
  const [form, setForm] = useState({
    players_maxcount: 2
  });

  async function changeForm(field) {
    setError("")
    setForm({...form, ...field})
  }
  
  useEffect(() => {
     setOkEnabled(true);
     setError(""); 
  }, [open]);

  async function OnClickOk() {
    if (form.players_maxcount < 2 || form.players_maxcount > 10) {
      setError(t("matches.players_maxcount_error"));
      return;
    }

    try {
        const res = await API.post("matches/", form);
        onSuccess(res.data);
        setOpen(false);
    } catch (err) {
        setError(err.response.data.detail || t("matches.create_match_error"));
        return;
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl ring-0">
        <DialogTitle/ >
        <h2 className="text-lg font-semibold text-center">
          {t("matches.create_match")}
        </h2>
        <div className="">
            <label>{t("matches.players_maxcount")}:</label>
            <Input 
              value={form.players_maxcount}
              className="w-full mt-4" 
              onChange={(e) => changeForm({ players_maxcount: e.target.value })} />
            {/* <Input placeholder={t("matches.time_limit")} className="w-full mt-4" /> */}
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

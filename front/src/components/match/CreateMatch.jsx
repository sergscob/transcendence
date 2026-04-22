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
    players_maxcount: 2,
    time_limit: 120,
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
    const playersMaxcount = Number(form.players_maxcount);
    const timeLimit = Number(form.time_limit);

    if (playersMaxcount < 2 || playersMaxcount > 10) {
      setError(t("matches.players_maxcount_error"));
      return;
    }

    if (timeLimit < 120 || timeLimit > 3600) {
      setError(t("matches.time_limit_error"));
      return;
    }

    try {
        const res = await API.post("matches/", {
          players_maxcount: playersMaxcount,
          time_limit: timeLimit,
        });
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
              type="number"
              min={2}
              max={10}
              value={form.players_maxcount}
              className="w-full mt-4" 
              onChange={(e) => changeForm({ players_maxcount: e.target.value })} />
            <label className="mt-4 block">{t("matches.time_limit")}:</label>
            <Input
              type="number"
              min={120}
              max={3600}
              step={10}
              value={form.time_limit}
              className="w-full mt-2"
              onChange={(e) => changeForm({ time_limit: e.target.value })}
            />
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

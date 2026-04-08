import { useEffect, useState } from "react";
import API from "@/api/api";
import { useUserStore } from "@/stores/userStore";
import Loading from "@/components/ui_int/Loading";
import Button from "@/components/ui_int/Button";
import NotFound from "@/pages/NotFound";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import CreateMatch from "@/components/match/CreateMatch";
import { Link } from "react-router-dom";


function OpenMatches() {
  const { t } = useTranslation();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const user = useUserStore((s) => s.user);
  const loaded = useUserStore((s) => s.loaded);
  const loading = useUserStore((s) => s.loading);
  const [waitingList, setWaitingList] = useState([]);
  const [MyList, setMyList] = useState([]);

  async function fetchAvailableMatches() {
    const res = await API.get("matches/available/")
    setWaitingList(res.data);
  }

  async function fetchMyMatch() {
    const res = await API.get("matches/")
    setMyList(res.data);
  }

  async function handleDeleteMyMatch(matchId) {
    try {
      await API.delete(`matches/${matchId}/`);
      await Promise.all([fetchAvailableMatches(), fetchMyMatch()]);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (loaded && user) {
      fetchAvailableMatches();
      fetchMyMatch();
    }
  }, [user]);


  if (loading) return <Loading />;
  if (!user) return <NotFound text={t("edit_friends.server_connection_error")} code={t("edit_friends.error_code")} />;

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      
        <div className="flex flex-col gap-4 border border-black rounded-md p-4 shadow-lg bg-white min-w-150" >
          {MyList.length > 0 && (
            <div className="flex items-center gap-3">
              <Link to={`/matches/${MyList[0].id}`} className="text-center mt-4 p-2 rounded-lg bg-blue-500 hover:bg-blue-700 text-white">
                  {t("matches.my_match")}
              </Link>
              <Button
                className="bg-red-500 hover:bg-red-700 text-white"
                onClick={() => handleDeleteMyMatch(MyList[0].id)}
              >
                {t("matches.delete_my_match")}
              </Button>
            </div>
          )}


          <div className="text-[20px] font-bold">{t("matches.open_matches")}</div>

            <Table className="">
            <TableHeader>
                <TableRow>
                <TableHead className="w-25">Creator</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Players</TableHead>
                <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {waitingList.map(match => (
                    <TableRow key={match.id}>
                    <TableCell className="font-medium">{match.created_by}</TableCell>
                    <TableCell>{match.status}</TableCell>
                    <TableCell>{match.num_players}/{match.players_maxcount}</TableCell>
                    <TableCell className="text-right">
                        <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Join
                        </Button>
                        </TableCell>
                    </TableRow>
                ))}

            </TableBody>
            </Table>
            <Button className="max-w-50 bg-green-500 hover:bg-green-700 text-white " onClick={() => setOpenCreateDialog(true)} disabled={MyList.length > 0}>
                {t("matches.create_match")}
            </Button>
            <CreateMatch 
              open={openCreateDialog} setOpen={setOpenCreateDialog} 
              onSuccess={() => Promise.all([fetchAvailableMatches(), fetchMyMatch()])}

            />
      </div>
    </div>
  );
}

export default OpenMatches;

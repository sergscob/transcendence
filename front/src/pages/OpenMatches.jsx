import { useEffect, useState } from "react";
import dayjs from "dayjs";
import API from "@/api/api";
import { useTranslation } from "react-i18next";
import { useUserStore } from "@/stores/userStore";
import { useGameStore } from "@/stores/gameStore";
import Loading from "@/components/ui_int/Loading";
import Button from "@/components/ui_int/Button";
import NotFound from "@/pages/NotFound";
import CreateMatch from "@/components/match/CreateMatch";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router";
import ButtonClose from "@/components/ui_int/ButtonClose";
import MatchesList from "@/components/match/MatchesList";

const DATE_FORMAT = "DD.MM.YYYY HH:mm";

function OpenMatches() {
    const { t } = useTranslation();
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const user = useUserStore((s) => s.user);
    const loaded = useUserStore((s) => s.loaded);
    const loading = useUserStore((s) => s.loading);
    const [waitingList, setWaitingList] = useState([]);
    const [currentList, setCurrentList] = useState([]);
    const [myList, setMyList] = useState([]);
    const setMatchId = useGameStore((s) => s.setMatchId);
    const navigate = useNavigate();

    const getStatusLabel = (status) => t(`matches.status_${status}`, { defaultValue: status });

    async function fetchAll() {
        let res = await API.get("matches/available/")
        setWaitingList(res.data);
        res = await API.get("matches/")
        setMyList(res.data);
        res = await API.get("matches/current/")
        setCurrentList(res.data);
    }

    async function deleteMyMatch(matchId) {
        try {
            await API.delete(`matches/${matchId}/`);
            await fetchAll();
            setMatchId("");
        } catch (err) {
            console.error(err);
        }
    }

    async function joinMatch(matchId) {
        try {
            await API.post(`matches/${matchId}/join/`);
            await fetchAll();
            setMatchId(matchId);
            navigate(`/game/${matchId}`);
        } catch (err) {
            console.error(err);
        }
    }

    function viewMatch(matchId) {
        navigate(`/game/${matchId}/?view=1`);
    }

    async function createdMatch(match) {
        try {
            await fetchAll();
            setMatchId(match.id);
            navigate(`/game/${match.id}`);
        } catch (err) {
            console.error(err);
        }
    }


    useEffect(() => {
        if (loaded && user) {
            fetchAll();
        }
    }, [user]);


    if (loading) return <Loading />;
    if (!user) return <NotFound text={t("edit_friends.server_connection_error")} code={t("edit_friends.error_code")} />;

    return (
        <div className="w-screen h-screen flex justify-center items-center">

            <div className="flex flex-col gap-4 text-white border border-black rounded-md p-4 shadow-lg bg-gray-500 min-w-150 relative">
                <ButtonClose onClose={() => navigate(-1)} className="absolute top-4 right-4" />

                {myList.length > 0 && (
                    <div className="flex items-center gap-1 flex-col">
                        {t("matches.you_are_in_a_match")}
                        <Link to={`/game/${myList[0].id}`} className="text-center mt-4 py-2 px-6 rounded-lg bg-blue-500 hover:bg-blue-700 text-white">
                            {t("matches.go_to_match")}
                        </Link>

                        <div>
                            {t("matches.players")}: {myList[0].num_players}/{myList[0].players_maxcount}
                        </div>
                        <div>
                            {t("matches.creator")}: {myList[0].created_by_name}
                        </div>
                        <div>
                            {t("matches.status")}: {getStatusLabel(myList[0].status)}
                        </div>
                        <div>
                            {t("matches.created_at")}: {dayjs(myList[0].created_at).format(DATE_FORMAT)}
                        </div>
                        <div>
                            {t("matches.started_at")}: {myList[0].started_at ? dayjs(myList[0].started_at).format(DATE_FORMAT) : t("matches.not_started")}
                        </div>
                        <Button
                            className="bg-red-500 hover:bg-red-700 text-white"
                            onClick={() => deleteMyMatch(myList[0].id)}
                        >
                            {user.id === myList[0].created_by ? t("matches.delete_my_match") : t("matches.leave_match")}
                        </Button>
                        <div className="mt-4 w-full border border-gray-800 h-px" />
                    </div>
                )}

                {waitingList.length > 0 && (
                    <div>
                    <div className="text-[20px] font-bold">{t("matches.open_matches")}</div>
                    <MatchesList
                        matches={waitingList}
                        actions={(match) => (
                            <Button
                                className="bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-500"
                                disabled={myList.length > 0}
                                onClick={() => joinMatch(match.id)}
                            >
                                {t("matches.join")}
                            </Button>
                        )}
                    />
                    </div>
                )}

                {currentList.length > 0 && (
                    <>
                    <div className="text-[20px] font-bold">{t("matches.open_matches")}</div>
                    <MatchesList
                        matches={currentList}
                        actions={(match) => (
                            <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => viewMatch(match.id)}>
                                {t("matches.view")}
                            </Button>
                        )}
                    />
                    </>
                )}

                {myList.length == 0 &&
                    <Button className="max-w-50 bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-500 "
                        onClick={() => setOpenCreateDialog(true)}
                        disabled={myList.length > 0}>
                        {t("matches.create_match")}
                    </Button>
                }
                <CreateMatch open={openCreateDialog} setOpen={setOpenCreateDialog} onSuccess={createdMatch} />
            </div>
        </div >
    );
}

export default OpenMatches;

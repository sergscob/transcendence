import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "@/api/api";
import Loading from "@/components/ui_int/Loading";
import Button from "@/components/ui_int/Button";
import NotFound from "@/pages/NotFound";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ButtonClose from "@/components/ui_int/ButtonClose";
import { useSorting, getSortIcon } from "@/utils/sortUtils";

const DATE_FORMAT = "DD.MM.YYYY HH:mm";

function UserMatches() {
    const pageSize = 10;
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [user, setUser ] = useState(null);
    const [matchData, setMatchData] = useState({ count: 0, results: [], next: null, previous: null });
    const [matches, setMatches] = useState([]);
    const navigate = useNavigate();
    const { userid } = useParams()
    const { sortBy, page, setPage, showSorted } = useSorting("-created_at");

    async function fetchMatches(pageNumber = 1) {
        const res = await API.get(`matches/user/${userid}/?order=${sortBy}&page=${pageNumber}&page_size=${pageSize}`);
        setMatchData(res.data);
        setMatches(res.data.results);
    }

    const loadUser = async () => {
        try {
            const res = await API.get(`profile/${userid}/`);
            setUser(res.data);
        } catch (err) {
            console.log("Error loading user profile:", err);
        }
   }

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await Promise.all([loadUser(), fetchMatches(page)]);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [page, sortBy, userid]);

    const totalPages = Math.max(1, Math.ceil((matchData.count || 0) / pageSize));

    const getResultLabel = result => result === "win" ? t("matches.win") : t("matches.loss");
    const getResultClass = result => result === "win" ? "text-emerald-300" : "text-red-300";

    if (loading) return <div></div>
    if (!user) return <NotFound />;

    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <div className="flex flex-col gap-4 border border-black rounded-md p-4 shadow-lg bg-gray-500 max-w-full relative" >
                <ButtonClose onClose={() => navigate(-1)} className="absolute top-4 right-4" /> 

                <div className="text-[20px] text-white">{t("matches.user_matches_title", {username: user?.username})}</div>

                <Table className="text-white">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="cursor-pointer" onClick={() => showSorted("created_at")}>
                                {t("matches.created_at")} {getSortIcon("created_at", sortBy)}
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => showSorted("user_result")}>
                                {t("matches.result")} {getSortIcon("user_result", sortBy)}
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => showSorted("user_score")}>
                                {t("matches.score")} {getSortIcon("user_score", sortBy)}
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => showSorted("finished_at")}>
                                {t("matches.finished_at")} {getSortIcon("finished_at", sortBy)}
                            </TableHead>
                            <TableHead>
                                {t("matches.other_players")} 
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {matches.map((match) => (
                            <TableRow key={match.id}>
                                <TableCell className="font-medium">{dayjs(match.created_at).format(DATE_FORMAT)}</TableCell>
                                <TableCell className={getResultClass(match.user_result)}>{getResultLabel(match.user_result)}</TableCell>
                                <TableCell>{match.user_score ?? 0}</TableCell>
                                <TableCell>{match.finished_at ? dayjs(match.finished_at).format(DATE_FORMAT) : "-"}</TableCell>
                                <TableCell>
                                   {match.players
                                        .filter(p => p.user != user.id)
                                        .map((player, index) => (
                                            <span key={player.user}>
                                                {index > 0 && ", "}
                                                <Link
                                                    to={`/profile/${player.user}`}
                                                    className={`${getResultClass(player.result)} underline underline-offset-2`}
                                                >
                                                    {player.username} 
                                                </Link>
                                            </span>
                                    ))}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="flex items-center justify-between gap-3 text-white">
                    <Button
                        className="max-w-40"
                        disabled={!matchData.previous || page <= 1}
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                        {t("total_stat.previous")}
                    </Button>

                    <span>{t("total_stat.page_info", { current: page, total: totalPages })}</span>

                    <Button
                        className="max-w-40"
                        disabled={!matchData.next || page >= totalPages}
                        onClick={() => setPage((current) => current + 1)}
                    >
                        {t("total_stat.next")}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default UserMatches;

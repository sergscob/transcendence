import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import API from "@/api/api";
import { useUserStore } from "@/stores/userStore";
import Loading from "@/components/ui_int/Loading";
import Button from "@/components/ui_int/Button";
import NotFound from "@/pages/NotFound";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Link } from "react-router-dom";
import ButtonClose from "@/components/ui_int/ButtonClose";
import ShortProfile from "@/components/common/ShortProfile";
import { useSorting, getSortIcon } from "@/utils/sortUtils";

function TotalStat() {
    const pageSize = 3;
    const { t } = useTranslation();
    const user = useUserStore((s) => s.user);
    const loading = useUserStore((s) => s.loading);
    const [statData, setStatData] = useState({ count: 0, results: [], next: null, previous: null });
    const [statArray, setStatArray] = useState([]);
    const [statFirst, setStatFirst] = useState([]);
    const [topUsersById, setTopUsersById] = useState({});
    const navigate = useNavigate();
    const { sortBy, page, setPage, showSorted } = useSorting("place");

    async function fetchStats(pageNumber = 1) {
        const resFirst = await API.get(`stats/?order=place&page=1&page_size=3`);
        const topStats = resFirst.data.results || [];
        setStatFirst(topStats);

        const topProfiles = await Promise.all(
            topStats.map(async (stat) => {
                try {
                    const profileRes = await API.get(`profile/${stat.user_id}/`);
                    return [stat.user_id, profileRes.data];
                } catch {
                    return [stat.user_id, { id: stat.user_id, username: stat.username, avatar: null }];
                }
            })
        );
        setTopUsersById(Object.fromEntries(topProfiles));

        const res = await API.get(`stats/?order=${sortBy}&page=${pageNumber}&page_size=${pageSize}`);
        setStatData(res.data);
        setStatArray(res.data.results);
    }

    useEffect(() => {
        fetchStats(page);
    }, [page, sortBy]);

    const totalPages = Math.max(1, Math.ceil((statData.count || 0) / pageSize));

    if (loading) return <Loading />;
    if (!user) return <NotFound text={t("edit_friends.server_connection_error")} code={t("edit_friends.error_code")} />;

    return (
        <div className="w-screen pt-12 pb-12">
        <div className="w-screen flex flex-col justify-center items-center gap-10">

            <div className="flex border border-black rounded-md p-2 shadow-lg bg-gray-500 max-w-full relative h-75 pt-0 align-top justify-between" >
                <ButtonClose onClose={() => navigate(-1)} className="absolute top-4 right-4" /> 
                {statFirst.length > 1 && (
                    <ShortProfile
                        user={topUsersById[statFirst[1].user_id] || { id: statFirst[1].user_id, username: statFirst[1].username, avatar: null }}
                        avatarSize="90"
                        stat={statFirst[1]}
                        className="mt-8 scale-80 w-1/3"
                    />
                )}
                {statFirst.length > 0 && (
                    <ShortProfile
                        user={topUsersById[statFirst[0].user_id] || { id: statFirst[0].user_id, username: statFirst[0].username, avatar: null }}
                        avatarSize="90"
                        stat={statFirst[0]}
                        className="scale-80 w-1/3 "
                    />
                )}
                {statFirst.length > 2 && (
                    <ShortProfile
                        user={topUsersById[statFirst[2].user_id] || { id: statFirst[2].user_id, username: statFirst[2].username, avatar: null }}
                        avatarSize="90"
                        stat={statFirst[2]}
                        className="mt-16 scale-80 w-1/3 "
                    />
                )}
            </div>

            <div className="flex flex-col gap-4 border border-black rounded-md p-4 shadow-lg bg-gray-500 max-w-full relative" >

                <div className="text-[20px] text-white">{t("total_stat.title")}</div>

                <Table className="text-white">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="cursor-pointer" onClick={() => showSorted("place")}>
                                {t("total_stat.place")} {getSortIcon("place", sortBy)}
                            </TableHead>
                            <TableHead className="w-25 cursor-pointer" onClick={() => showSorted("username")}>
                                {t("total_stat.player")} {getSortIcon("username", sortBy)}
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => showSorted("total_matches")}>
                                {t("total_stat.total_matches")} {getSortIcon("total_matches", sortBy)}
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => showSorted("wins")}>
                                {t("total_stat.wins")} {getSortIcon("wins", sortBy)}
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => showSorted("score")}>
                                {t("total_stat.score")} {getSortIcon("score", sortBy)}
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => showSorted("level")}>
                                {t("total_stat.level")} {getSortIcon("level", sortBy)}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {statArray.map((stat) => (
                            <TableRow key={stat.user_id}>
                                <TableCell className="font-medium">{stat.place}</TableCell>
                                {/* <TableCell><Link to={`/profile/${stat.user_id}`}>{stat.username}</Link></TableCell> */}
                                <TableCell><Link to={`/usermatches/${stat.user_id}`} className="underline underline-offset-2 break-all inline-block max-w-50">
								<div className="inline-block max-w-50">
									{stat.username}
								</div>
                                </Link></TableCell>
                                <TableCell>{stat.total_matches}</TableCell>
                                <TableCell>{stat.wins}</TableCell>
                                <TableCell>{stat.score}</TableCell>
                                <TableCell>{stat.level}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="flex items-center justify-between gap-2 text-white">
                    <Button
                        className="max-w-40"
                        disabled={!statData.previous || page <= 1}
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                        {t("total_stat.previous")}
                    </Button>

                    <Button
                        className="max-w-40"
                        disabled={!statData.next || page >= totalPages}
                        onClick={() => setPage((current) => current + 1)}
                    >
                        {t("total_stat.next")}
                    </Button>
                </div>
				<div className="flex justify-center items-center">
					<span>{t("total_stat.page_info", { current: page, total: totalPages })}</span>
				</div>
            </div>
        </div>
        </div>
    );
}

export default TotalStat;

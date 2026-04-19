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

function TotalStat() {
    const { t } = useTranslation();
    const user = useUserStore((s) => s.user);
    const loaded = useUserStore((s) => s.loaded);
    const loading = useUserStore((s) => s.loading);
    const [statData, setStatData] = useState([]);
    const [statArray, setStatArray] = useState([]);
    const [sortBy, setSortBy] = useState("place");
    const navigate = useNavigate();

    function showSorted(sort) {
        let sort2 = sort[0] === "-" ? sort.slice(1) : sort;
        let sortBy2 = sortBy[0] === "-" ? sortBy.slice(1) : sortBy;
        if (sort2 === sortBy2) {
            if (sortBy[0] === '-') 
                setSortBy(sort2);
            else 
                setSortBy("-" + sort2);
        } else {
            setSortBy(sort);
        }
    }

    function getSortIcon(sort) {
        let sortBy2 = sortBy[0] === "-" ? sortBy.slice(1) : sortBy;
        if (sort === sortBy2) 
            return sortBy[0] === '-' ? "↓" : "↑";
        return "";
    }   

    async function fetchAll() {
        const res = await API.get("stats/?order=" + sortBy)
        setStatData(res.data);
        setStatArray(res.data.results);
    }

    async function fetchNext() {
        if (!statData.next)
            return;
        const res = await API.get(statData.next)
        setStatData(res.data);
        setStatArray([...statArray, ...res.data.results]);
    }

    useEffect(() => {
        fetchAll();
    }, [sortBy]);


    if (loading) return <Loading />;
    if (!user) return <NotFound text={t("edit_friends.server_connection_error")} code={t("edit_friends.error_code")} />;

    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <div className="flex flex-col gap-4 border border-black rounded-md p-4 shadow-lg bg-gray-500 min-w-150 relative" >
                <ButtonClose onClose={() => navigate(-1)} className="absolute top-4 right-4" /> 

                <div className="text-[20px] text-white">{t("total_stat.title")}</div>

                <Table className="text-white">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="cursor-pointer" onClick={() => showSorted("place")}>
                                {t("total_stat.place")} {getSortIcon("place")}
                            </TableHead>
                            <TableHead className="w-25 cursor-pointer" onClick={() => showSorted("username")}>
                                {t("total_stat.player")} {getSortIcon("username")}
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => showSorted("total_matches")}>
                                {t("total_stat.total_matches")} {getSortIcon("total_matches")}
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => showSorted("wins")}>
                                {t("total_stat.wins")} {getSortIcon("wins")}
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => showSorted("score")}>
                                {t("total_stat.score")} {getSortIcon("score")}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {statArray.map((stat) => (
                            <TableRow key={stat.user_id}>
                                <TableCell className="font-medium">{stat.place}</TableCell>
                                <TableCell><Link to={`/profile/${stat.user_id}`}>{stat.username}</Link></TableCell>
                                <TableCell>{stat.total_matches}</TableCell>
                                <TableCell>{stat.wins}</TableCell>
                                <TableCell>{stat.score}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {statData.next && (
                    <Button className="max-w-50 _bg-green-500 _hover:bg-green-600 _text-white"
                        onClick={() => fetchNext()}
                    >
                        {t("total_stat.load_more")}
                    </Button>
                )}
            </div>
        </div>
    );
}

export default TotalStat;

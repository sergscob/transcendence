import { useEffect, useState } from "react";
import API from "@/api/api";
import { useUserStore } from "@/stores/userStore";
import Loading from "@/components/ui_int/Loading";
import Button from "@/components/ui_int/Button";
import NotFound from "@/pages/NotFound";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Link } from "react-router-dom";


function TotalStat() {
    const { t } = useTranslation();
    const user = useUserStore((s) => s.user);
    const loaded = useUserStore((s) => s.loaded);
    const loading = useUserStore((s) => s.loading);
    const [statData, setStatData] = useState([]);
    const [statArray, setStatArray] = useState([]);

    async function fetchAll() {
        const res = await API.get("stats/")
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
    }, []);


    if (loading) return <Loading />;
    if (!user) return <NotFound text={t("edit_friends.server_connection_error")} code={t("edit_friends.error_code")} />;

    return (
        <div className="w-screen h-screen flex justify-center items-center">

            <div className="flex flex-col gap-4 border border-black rounded-md p-4 shadow-lg bg-white min-w-150" >

                <div className="text-[20px] font-bold">{t("total_stat.title")}</div>

                <Table className="">
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("total_stat.place")}</TableHead>
                            <TableHead className="w-25">{t("total_stat.player")}</TableHead>
                            <TableHead>{t("total_stat.total_matches")}</TableHead>
                            <TableHead>{t("total_stat.wins")}</TableHead>
                            <TableHead>{t("total_stat.score")}</TableHead>
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
                    <Button className="max-w-50 bg-green-500 hover:bg-green-600 text-white"
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

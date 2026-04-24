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
import { getAchivmentMessage } from "@/utils/achivements";

const DATE_FORMAT = "DD.MM.YYYY HH:mm";

function UserAchievements() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [user, setUser ] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const navigate = useNavigate();
    const { userid } = useParams()

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const resUser = await API.get(`profile/${userid}/`);
                setUser(resUser.data);
                const res = await API.get(`achievements/${userid}/`);
                setAchievements(res.data);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [userid]);

    if (loading) return <div></div>
    if (!user) return <NotFound />;

    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <div className="flex flex-col gap-4 border border-black rounded-md p-5 shadow-lg bg-gray-500 max-w-full relative" >
                <ButtonClose onClose={() => navigate(-1)} className="absolute top-4 right-4" /> 

                    <div className="text-[20px] text-white">{t("achievements.user_achievements_title", {username: user?.username})}</div>

                { achievements.length > 0 ? (
                <Table className="text-white bg-slate-800/50">
                    <TableBody>
                        {achievements.map((achievement) => (
                            <TableRow key={achievement.id}>
                                <TableCell className="font-medium">{dayjs(achievement.created_at).format(DATE_FORMAT)}</TableCell>
                                <TableCell>{getAchivmentMessage(achievement)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                ) : (
                    <div className="text-white">{t("view_achievements.no_achievements")}</div>
                )}
            </div>
        </div>
    );
}

export default UserAchievements;

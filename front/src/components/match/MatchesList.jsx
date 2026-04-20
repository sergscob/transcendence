import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const DATE_FORMAT = "DD.MM.YYYY HH:mm";

function MatchesList({ matches, actions, title }) {
    const { t } = useTranslation();

    const getStatusLabel = (status) => t(`matches.status_${status}`, { defaultValue: status });

    return (
        <>
            <div className="text-[16px] mb-0 mt-4">{title}</div>

            <Table className="border rounded-lg bg-slate-800/50">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-25">{t("matches.creator")}</TableHead>
                        <TableHead>{t("matches.status")}</TableHead>
                        <TableHead>{t("matches.players")}</TableHead>
                        <TableHead>{t("matches.created_at")}</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {matches?.map(match => (
                        <TableRow key={match.id}>
                            <TableCell className="font-medium">{match.created_by_name}</TableCell>
                            <TableCell>{getStatusLabel(match.status)}</TableCell>
                            <TableCell>{match.num_players}/{match.players_maxcount}</TableCell>
                            <TableCell>{ dayjs(match.created_at).format(DATE_FORMAT)   }</TableCell>
                            <TableCell className="text-right">
                                {typeof actions === "function" ? actions(match) : actions}
                            </TableCell>
                        </TableRow>
                    ))} 

                </TableBody>
            </Table>
        </>
        
  );
}

export default MatchesList;

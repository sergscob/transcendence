import { useState } from "react";

export function useSorting(defaultSortBy) {
    const [sortBy, setSortBy] = useState(defaultSortBy);
    const [page, setPage] = useState(1);
 
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
        setPage(1);
    }

    return { sortBy, page, setPage, showSorted };
}

export function getSortIcon(sort, sortBy) {
    let sortBy2 = sortBy[0] === "-" ? sortBy.slice(1) : sortBy;
    if (sort === sortBy2) 
        return sortBy[0] === '-' ? "↓" : "↑";
    return "";
}   

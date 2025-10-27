import React from "react";

export const fetchDahsboardData = async (url: string) => {
    try {
    const response = await fetch(`http://localhost:8080/${url}`);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return response;
    } catch (err: any) {
    console.error("Error fetching sales data:", err);
    }
}
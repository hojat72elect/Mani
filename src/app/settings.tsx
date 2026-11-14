import {ThemedView} from "@/shared/ui/ThemedView";
import React from "react";
import {ThemedText} from "@/shared/ui/ThemedText";

export default function SettingsScreen() {
    return (
        <ThemedView style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <ThemedText>Settings Screen</ThemedText>
        </ThemedView>
    );
}
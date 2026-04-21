"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

interface Props {
  kommunenummer: string;
  hasData: boolean;
}

export default function PropertyViewTracker({ kommunenummer, hasData }: Props) {
  useEffect(() => {
    track("property_viewed", { kommunenummer, hasData });
  }, [kommunenummer, hasData]);

  return null;
}

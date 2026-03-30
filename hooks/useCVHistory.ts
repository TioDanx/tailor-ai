"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { CVHistoryEntry } from "@/types";

export function useCVHistory(maxItems = 50) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<CVHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const ref = collection(db, "users", user.uid, "cvHistory");
    const q   = query(ref, orderBy("createdAt", "desc"), limit(maxItems));

    setLoading(true);
    getDocs(q).then((snap) => {
      const docs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as CVHistoryEntry[];
      setEntries(docs);
      setLoading(false);
    });
  }, [user, maxItems]);

  return { entries, loading };
}

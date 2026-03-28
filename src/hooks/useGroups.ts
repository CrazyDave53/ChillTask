import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Group } from '../types';

function parseDoc<T extends Record<string, unknown>>(data: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      result[key] = value.toDate().toISOString();
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

export function useGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'groups'),
      where('userId', '==', user.uid),
      orderBy('order', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...parseDoc(d.data()) } as Group))
        .filter((g) => g.userId === user.uid);
      setGroups(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const addGroup = async (name: string) => {
    if (!user) return;
    const maxOrder = groups.reduce((m, g) => Math.max(m, g.order), -1);
    await addDoc(collection(db, 'groups'), {
      name,
      order: maxOrder + 1,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
  };

  const renameGroup = async (id: string, name: string) => {
    await updateDoc(doc(db, 'groups', id), { name });
  };

  const deleteGroup = async (id: string) => {
    await deleteDoc(doc(db, 'groups', id));
  };

  const reorderGroups = async (reordered: Group[]) => {
    const batch = reordered.map((g, i) =>
      updateDoc(doc(db, 'groups', g.id), { order: i })
    );
    await Promise.all(batch);
  };

  return { groups, loading, addGroup, renameGroup, deleteGroup, reorderGroups };
}

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
import { Task } from '../types';

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

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...parseDoc(d.data()) } as Task));
      setTasks(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const addTask = async (title: string, deadline: string | null, groupId: string | null) => {
    if (!user) return;
    await addDoc(collection(db, 'tasks'), {
      title,
      deadline,
      groupId,
      isActive: false,
      isArchived: false,
      archiveStatus: null,
      archivedAt: null,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    await updateDoc(doc(db, 'tasks', id), updates);
  };

  const toggleActive = async (task: Task) => {
    await updateDoc(doc(db, 'tasks', task.id), { isActive: !task.isActive });
  };

  const archiveTask = async (task: Task, status: 'done' | 'skipped') => {
    await updateDoc(doc(db, 'tasks', task.id), {
      isArchived: true,
      archiveStatus: status,
      archivedAt: new Date().toISOString(),
      isActive: false,
    });
  };

  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, 'tasks', id));
  };

  const moveToUncategorized = async (groupId: string) => {
    const tasksToMove = tasks.filter((t) => t.groupId === groupId);
    const batch = tasksToMove.map((t) =>
      updateDoc(doc(db, 'tasks', t.id), { groupId: null })
    );
    await Promise.all(batch);
  };

  return { tasks, loading, addTask, updateTask, toggleActive, archiveTask, deleteTask, moveToUncategorized };
}

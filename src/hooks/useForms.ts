import { useState, useEffect } from 'react'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy, getDoc, where, writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Form } from '../types'

const FORMS_COLLECTION = 'forms'

function cleanFirestoreData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

async function activeEnrollmentDocs() {
  const q = query(collection(db, FORMS_COLLECTION), where('isActive', '==', true))
  const snapshot = await getDocs(q)
  return snapshot.docs.filter(d => (d.data() as Partial<Form>).type === 'enrollment')
}

export function useForms() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)

  const fetchForms = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, FORMS_COLLECTION), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      setForms(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Form)))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchForms() }, [])

  const getForm = async (id: string): Promise<Form | null> => {
    const snapshot = await getDoc(doc(db, FORMS_COLLECTION, id))
    if (!snapshot.exists()) return null
    return { id: snapshot.id, ...snapshot.data() } as Form
  }

  const createForm = async (form: Omit<Form, 'id' | 'createdAt'>): Promise<string> => {
    const cleaned = cleanFirestoreData(form)
    const formsRef = collection(db, FORMS_COLLECTION)

    if (cleaned.type === 'enrollment' && cleaned.isActive) {
      const docRef = doc(formsRef)
      const batch = writeBatch(db)
      const activeDocs = await activeEnrollmentDocs()

      activeDocs.forEach(d => batch.update(d.ref, { isActive: false }))
      batch.set(docRef, { ...cleaned, createdAt: serverTimestamp() })

      await batch.commit()
      await fetchForms()
      return docRef.id
    }

    const docRef = await addDoc(formsRef, {
      ...cleaned,
      createdAt: serverTimestamp(),
    })
    await fetchForms()
    return docRef.id
  }

  const updateForm = async (id: string, updates: Partial<Omit<Form, 'id' | 'createdAt'>>): Promise<void> => {
    const cleaned = cleanFirestoreData(updates)
    const ref = doc(db, FORMS_COLLECTION, id)
    const currentSnapshot = await getDoc(ref)
    const current = currentSnapshot.exists() ? (currentSnapshot.data() as Partial<Form>) : {}
    const nextType = cleaned.type ?? current.type
    const nextIsActive = cleaned.isActive ?? current.isActive

    if (nextType === 'enrollment' && nextIsActive === true) {
      const batch = writeBatch(db)
      const activeDocs = await activeEnrollmentDocs()

      activeDocs.forEach(d => {
        if (d.id !== id) batch.update(d.ref, { isActive: false })
      })
      batch.update(ref, cleaned)
      await batch.commit()
    } else {
      await updateDoc(ref, cleaned)
    }

    await fetchForms()
  }

  const deleteForm = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, FORMS_COLLECTION, id))
    await fetchForms()
  }

  return { forms, loading, getForm, createForm, updateForm, deleteForm }
}

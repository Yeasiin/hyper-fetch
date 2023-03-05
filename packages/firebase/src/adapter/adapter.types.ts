import {Firestore} from "firebase/firestore";
import {Database} from "firebase/database";
import {BaseAdapterType} from "@hyper-fetch/core";

// eslint-disable-next-line
export type SelectedFirebaseAdapterType<DBType> =
  DBType extends Firestore
    ? BaseAdapterType<DefaultFirebaseAdapterOptions, FirestoreDBMethods>
    : DBType extends Database
    ? BaseAdapterType<DefaultFirebaseAdapterOptions, BaseRealtimeDBMethods>
    : never

export type DefaultFirebaseAdapterOptions = {
  data: string;
  filterBy: RealtimeDBFilteringParams | RealtimeDBFilteringParams[];
  orderBy: RealtimeDBOrderingParams | RealtimeDBOrderingParams[];
  listenOn: RealtimeListeners | RealtimeListeners[];
}

export type BaseRealtimeDBMethods = "set" | "push" | "update" | "get" | "remove" | "observer"
export type RealtimeListeners = "onValue" | "onChildAdded" | "onChildRemoved" | "onChildMoved" | "onChildChanged"

export type RealtimeDBFilteringParams = "limitToFirst" | "limitToLast" | "startAt" | "startAfter" | "endAt" | "endBefore" | "equalTo"
export type RealtimeDBOrderingParams = "orderByChild" | "orderByKey" | "orderByValue"

export type FirestoreDBMethods = "addDoc" | "getDoc" | "getDocs" | "setDoc" | "updateDoc" | "deleteDoc"

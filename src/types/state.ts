import type { initialState } from "../state/schema";

export interface AppState extends Omit<typeof initialState, keyof any[]> {}
export type IUser = {
  id: number;
  email: string;
};

export interface Action<T> {
  action: string;
  payload: T;
}

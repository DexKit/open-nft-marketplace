import { Action } from '../types/actions';
import { Transaction } from '../types/blockchain';

export const CREATE_NOTIFICATION = 'CREATE_NOTIFICATION';

export function createNotificationAction(
  transaction: Transaction
): Action<Transaction> {
  return { action: CREATE_NOTIFICATION, payload: transaction };
}

export const UPDATE_NOTIFICATION = 'UPDATE_NOTIFICATION';

export function updateNotificationAction(
  transaction: Transaction
): Action<Transaction> {
  return { action: UPDATE_NOTIFICATION, payload: transaction };
}

export const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';

export function removeNotification(
  transaction: Transaction
): Action<Transaction> {
  return { action: REMOVE_NOTIFICATION, payload: transaction };
}

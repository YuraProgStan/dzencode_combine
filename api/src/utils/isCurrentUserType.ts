import { CurrentUserType } from '../user/types';

export const isCurrentUserType = (obj: any): obj is CurrentUserType => {
  return (
    typeof obj?.id === 'number' &&
    typeof obj?.username === 'string' &&
    Object.keys(obj).length === 2
  );
};

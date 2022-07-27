export const DEFAULT_PAGE_NUMBER = 1;
export const DEFAULT_PAGE_SIZE = 10;

export const removeObjectIdOption = { _id: 0, __v: 0 };

export const commentsProjection = { ...removeObjectIdOption, postId: 0 };

export const projectionUserItem = { _id: 0, id: 1, login: 1, email: 1 };

export const projectionCreateUserItem = { _id: 0, id: 1, login: 1 };

export const regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

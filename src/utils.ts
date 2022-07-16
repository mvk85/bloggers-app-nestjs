import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from './const';
import { PaginationParams } from './types';

export async function generateHash(password: string) {
  const hash = await bcrypt.hash(password, 10);

  return hash;
}

export function generatePaginationData(
  paginationParams: PaginationParams,
  countItems: number,
) {
  const pageNumber = paginationParams.PageNumber
    ? Number(paginationParams.PageNumber)
    : DEFAULT_PAGE_NUMBER;

  const pageSize = paginationParams.PageSize
    ? Number(paginationParams.PageSize)
    : DEFAULT_PAGE_SIZE;

  const skip = (pageNumber - 1) * pageSize;

  const pagesCount = Math.ceil(countItems / pageSize);

  return {
    pageNumber,
    pageSize,
    pagesCount,
    skip,
  };
}

export function generateCustomId() {
  return String(+new Date());
}

export const generateConfirmCode = () => uuidv4();

export const newIsoDate = () => new Date().toISOString();

export const newDateInMilliseconds = () => new Date().getTime();

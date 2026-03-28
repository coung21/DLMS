import axios from 'axios';

const normalizeDetail = (detail: unknown): string | null => {
  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const [firstItem] = detail;

    if (typeof firstItem === 'string') {
      return firstItem;
    }

    if (typeof firstItem === 'object' && firstItem !== null && 'msg' in firstItem) {
      const message = firstItem.msg;
      return typeof message === 'string' ? message : JSON.stringify(firstItem);
    }
  }

  if (typeof detail === 'object' && detail !== null) {
    if ('msg' in detail && typeof detail.msg === 'string') {
      return detail.msg;
    }

    return JSON.stringify(detail);
  }

  return null;
};

export const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    return normalizeDetail(error.response?.data?.detail) || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

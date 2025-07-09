export const errorToString = (error: unknown) => {
    if (error instanceof Error) {
        return error.message;
      } else if (typeof error === 'string') {
        return error;
      } else {
        return 'An unknown error occurred.';
      }
}
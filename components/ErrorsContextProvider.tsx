/*
 * Copyright 2025 NEC Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Represents the type of the error message context.
 */
export type ErrorMessageContextType = {
  /** The title of the error message. */
  title: string;
  /** The detailed message of the error. */
  message?: string;
  /** The name of the API associated with the error. */
  apiName: string;
};

/** Represents the type of the error context value. */
type ErrorsContextType = [ErrorMessageContextType[], Dispatch<SetStateAction<ErrorMessageContextType[]>>];

/** Represents the ErrorsContext component. */
export const ErrorsContext = createContext<ErrorsContextType>([[], () => void {}]);

/**
 * Represents the ErrorsContextProvider component.
 * @param children - The child components.
 */
export const ErrorsContextProvider = ({ children }: { children: ReactNode }) => {
  const [errorMessages, setErrorMessages] = useState<ErrorMessageContextType[]>([]);
  const contextValue: ErrorsContextType = useMemo(
    () => [errorMessages, setErrorMessages],
    [errorMessages, setErrorMessages]
  );

  return <ErrorsContext.Provider value={contextValue}>{children}</ErrorsContext.Provider>;
};

/**
 * Custom hook to set error messages in the context.
 * @param apiName - The name of the API.
 * @param error - The error object.
 */

export const useSetErrorInContext = (
  apiName: string,
  error: null | undefined | { message: string; response?: { data: { message: string } } }
) => {
  const [, setErrorMessages] = useContext(ErrorsContext);

  useEffect(() => {
    if (error !== null && typeof error === 'object') {
      const parsedError = { title: error.message, message: error.response?.data.message || '', apiName: apiName };
      setErrorMessages((prev) => [...prev.filter((e) => e.apiName !== apiName), parsedError]);
    } else {
      setErrorMessages((prev) => prev.filter((e) => e.apiName !== apiName));
    }
  }, [error, setErrorMessages, apiName]);
};

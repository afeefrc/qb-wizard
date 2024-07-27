import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import { getQuestions, addQuestion, deleteQuestion } from '../utils/db';

interface AppContextProps {
  questions: any[];
  handleAddQuestion: (newQuestion: any) => Promise<void>;
  handleDeleteQuestion: (id: number) => Promise<void>;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const allQuestions = await getQuestions();
      setQuestions(allQuestions);
    };
    fetchQuestions();
  }, []);

  const handleAddQuestion = async (newQuestion: any) => {
    await addQuestion(newQuestion);
    const allQuestions = await getQuestions();
    setQuestions(allQuestions);
  };

  const handleDeleteQuestion = async (id: number) => {
    await deleteQuestion(id);
    const allQuestions = await getQuestions();
    setQuestions(allQuestions);
  };

  const contextValue = useMemo(
    () => ({
      questions,
      handleAddQuestion,
      handleDeleteQuestion,
    }),
    [questions],
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
